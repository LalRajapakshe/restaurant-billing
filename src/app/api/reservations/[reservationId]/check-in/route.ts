import { NextRequest, NextResponse } from "next/server";

import { getDbPool, sql } from "@/lib/db";

type ReservationCheckInRouteContext = {
  params: Promise<{ reservationId: string }>;
};

function parseReservationId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function generateStayNo() {
  return `STY-${Date.now()}`;
}

type ReservationForCheckIn = {
  reservationId: number;
  reservationNo: string;
  guestName: string;
  mobileNo: string | null;
  arrivalDate: string;
  departureDate: string;
  nights: number;
  roomType: string;
  reservedRoomId: number | null;
  adults: number;
  children: number;
  boardBasisId: number;
  totalEstimate: number;
  advancePayment: number;
  reservationStatus: string;
  note: string | null;
  defaultRate: number | null;
};

type StayProcedureRow = {
  stayId: number;
  stayNo: string;
  reservationId?: number | null;
  roomId: number;
  roomNo?: string | null;
  roomType?: string | null;
  guestName: string;
  mobileNo?: string | null;
  checkInDate?: string | null;
  expectedCheckOutDate?: string | null;
  actualCheckOutDate?: string | null;
  nights?: number;
  adults?: number;
  children?: number;
  boardBasisId?: number | null;
  boardBasisName?: string | null;
  roomRate?: number;
  stayStatus?: string | null;
  note?: string | null;
};

export async function POST(
  request: NextRequest,
  { params }: ReservationCheckInRouteContext
) {
  const { reservationId } = await params;
  const parsedReservationId = parseReservationId(reservationId);

  if (!parsedReservationId) {
    return NextResponse.json(
      { success: false, error: "Invalid reservation id." },
      { status: 400 }
    );
  }

  const pool = await getDbPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const reservationRequest = new sql.Request(transaction);
    reservationRequest.input("ReservationId", sql.BigInt, parsedReservationId);

    const reservationResult = await reservationRequest.query<ReservationForCheckIn>(
      `
      SELECT TOP (1)
          r.reservation_id AS reservationId,
          r.reservation_no AS reservationNo,
          r.guest_name AS guestName,
          r.mobile_no AS mobileNo,
          CONVERT(VARCHAR(10), r.arrival_date, 23) AS arrivalDate,
          CONVERT(VARCHAR(10), r.departure_date, 23) AS departureDate,
          r.nights,
          r.room_type AS roomType,
          r.reserved_room_id AS reservedRoomId,
          r.adults,
          r.children,
          r.board_basis_id AS boardBasisId,
          r.total_estimate AS totalEstimate,
          r.advance_payment AS advancePayment,
          r.reservation_status AS reservationStatus,
          r.note,
          rm.default_rate AS defaultRate
      FROM hotel.reservation r
      LEFT JOIN hotel.room rm
          ON rm.room_id = r.reserved_room_id
      WHERE r.reservation_id = @ReservationId
      `
    );

    const reservation = reservationResult.recordset[0];

    if (!reservation) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, error: "Reservation not found." },
        { status: 404 }
      );
    }

    if (!reservation.reservedRoomId) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, error: "Reservation must have an assigned room before check-in." },
        { status: 400 }
      );
    }

    if (["Cancelled", "No Show", "Checked Out", "Checked In"].includes(reservation.reservationStatus)) {
      await transaction.rollback();
      return NextResponse.json(
        {
          success: false,
          error: `Reservation status ${reservation.reservationStatus} cannot be checked in.`,
        },
        { status: 400 }
      );
    }

    const stayRate =
      Number(reservation.totalEstimate ?? 0) > 0 && Number(reservation.nights ?? 0) > 0
        ? Number(reservation.totalEstimate) / Number(reservation.nights)
        : Number(reservation.defaultRate ?? 0);

    const stayRequest = new sql.Request(transaction);
    stayRequest.input("StayNo", sql.NVarChar(30), generateStayNo());
    stayRequest.input("ReservationId", sql.BigInt, parsedReservationId);
    stayRequest.input("RoomId", sql.BigInt, reservation.reservedRoomId);
    stayRequest.input("GuestName", sql.NVarChar(200), reservation.guestName);
    stayRequest.input("MobileNo", sql.NVarChar(30), reservation.mobileNo);
    stayRequest.input("CheckInDate", sql.Date, reservation.arrivalDate);
    stayRequest.input("ExpectedCheckOutDate", sql.Date, reservation.departureDate);
    stayRequest.input("Adults", sql.Int, Number(reservation.adults ?? 1));
    stayRequest.input("Children", sql.Int, Number(reservation.children ?? 0));
    stayRequest.input("BoardBasisId", sql.Int, Number(reservation.boardBasisId));
    stayRequest.input("RoomRate", sql.Decimal(18, 2), stayRate);
    stayRequest.input("Note", sql.NVarChar(1000), reservation.note ?? null);
    stayRequest.input("CreatedByUserId", sql.Numeric(18, 0), null);

    const stayResult = await stayRequest.execute<StayProcedureRow>("hotel.sp_stay_create");
    const stay = stayResult.recordset?.[0] ?? null;

    if (!stay?.stayId) {
      throw new Error("Stay creation did not return a stay id.");
    }

    if (Number(reservation.advancePayment ?? 0) > 0) {
      const advanceRequest = new sql.Request(transaction);
      advanceRequest.input("StayId", sql.BigInt, Number(stay.stayId));
      advanceRequest.input("RoomId", sql.BigInt, Number(reservation.reservedRoomId));
      advanceRequest.input("ReservationId", sql.BigInt, parsedReservationId);
      advanceRequest.input("ReservationNo", sql.NVarChar(30), reservation.reservationNo);
      advanceRequest.input("AdvancePayment", sql.Decimal(18, 2), Number(reservation.advancePayment));

      await advanceRequest.query(
        `
        INSERT INTO hotel.folio_entry (
            stay_id,
            room_id,
            entry_type,
            source_module,
            source_doc_type,
            source_doc_id,
            description,
            debit_amount,
            credit_amount,
            posting_date,
            payment_method,
            note,
            created_by_user_id
        )
        VALUES (
            @StayId,
            @RoomId,
            'payment',
            'frontoffice',
            'Reservation Advance',
            CAST(@ReservationId AS NVARCHAR(50)),
            CONCAT('Reservation Advance ', @ReservationNo),
            0,
            @AdvancePayment,
            SYSDATETIME(),
            'System',
            'Transferred from reservation advance during check-in.',
            NULL
        )
        `
      );
    }

    const updateReservationRequest = new sql.Request(transaction);
    updateReservationRequest.input("ReservationId", sql.BigInt, parsedReservationId);

    await updateReservationRequest.query(
      `
      UPDATE hotel.reservation
      SET reservation_status = 'Checked In',
          updated_at = SYSDATETIME()
      WHERE reservation_id = @ReservationId
      `
    );

    await transaction.commit();

    return NextResponse.json({
      success: true,
      data: {
        reservationId: parsedReservationId,
        stay,
        advanceTransferred: Number(reservation.advancePayment ?? 0) > 0,
        advanceAmount: Number(reservation.advancePayment ?? 0),
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("POST /api/reservations/[reservationId]/check-in failed", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to check in reservation.",
      },
      { status: 500 }
    );
  }
}
