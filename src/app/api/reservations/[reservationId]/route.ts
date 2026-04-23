import { NextRequest, NextResponse } from "next/server";

import { getDbPool, sql } from "@/lib/db";

function dateDiffNights(arrivalDate: string, departureDate: string) {
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  const diff = departure.getTime() - arrival.getTime();
  return Math.round(diff / 86400000);
}

type ReservationRouteContext = {
  params: Promise<{ reservationId: string }>;
};

function parseReservationId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(
  request: NextRequest,
  { params }: ReservationRouteContext
) {
  try {
    const { reservationId } = await params;
    const parsedReservationId = parseReservationId(reservationId);

    if (!parsedReservationId) {
      return NextResponse.json(
        { success: false, error: "Invalid reservation id." },
        { status: 400 }
      );
    }

    const pool = await getDbPool();
    const result = await pool.request()
      .input("ReservationId", sql.BigInt, parsedReservationId)
      .query(
        `
        SELECT
            r.reservation_id AS reservationId,
            r.reservation_no AS reservationNo,
            r.guest_name AS guestName,
            r.mobile_no AS mobileNo,
            r.email,
            r.arrival_date AS arrivalDate,
            r.departure_date AS departureDate,
            r.nights,
            r.room_type AS roomType,
            r.reserved_room_id AS reservedRoomId,
            rm.room_no AS reservedRoomNo,
            r.adults,
            r.children,
            r.board_basis_id AS boardBasisId,
            bb.board_basis_name AS boardBasisName,
            r.advance_payment AS advancePayment,
            r.total_estimate AS totalEstimate,
            r.reservation_status AS reservationStatus,
            r.note,
            r.created_at AS createdAt
        FROM hotel.reservation r
        LEFT JOIN hotel.room rm
            ON rm.room_id = r.reserved_room_id
        LEFT JOIN hotel.board_basis bb
            ON bb.board_basis_id = r.board_basis_id
        WHERE r.reservation_id = @ReservationId
        `
      );

    const reservation = result.recordset[0] ?? null;

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "Reservation not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error("GET /api/reservations/[reservationId] failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load reservation.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: ReservationRouteContext
) {
  const { reservationId } = await params;
  const parsedReservationId = parseReservationId(reservationId);

  if (!parsedReservationId) {
    return NextResponse.json(
      { success: false, error: "Invalid reservation id." },
      { status: 400 }
    );
  }

  const body = (await request.json()) as {
    guestName: string;
    mobileNo?: string | null;
    email?: string | null;
    arrivalDate: string;
    departureDate: string;
    roomType: string;
    reservedRoomId?: number | null;
    adults: number;
    children: number;
    boardBasisId: number;
    advancePayment?: number;
    totalEstimate?: number;
    reservationStatus: string;
    note?: string | null;
    updatedByUserId?: number | null;
  };

  const nights = dateDiffNights(body.arrivalDate, body.departureDate);

  if (!Number.isFinite(nights) || nights <= 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Departure date must be after arrival date.",
      },
      { status: 400 }
    );
  }

  const pool = await getDbPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const previousRoomResult = await new sql.Request(transaction)
      .input("ReservationId", sql.BigInt, parsedReservationId)
      .query<{ previousRoomId: number | null }>(
        `
        SELECT reserved_room_id AS previousRoomId
        FROM hotel.reservation
        WHERE reservation_id = @ReservationId
        `
      );

    const previousRoomId = previousRoomResult.recordset[0]?.previousRoomId ?? null;

    const updateRequest = new sql.Request(transaction);
    updateRequest.input("ReservationId", sql.BigInt, parsedReservationId);
    updateRequest.input("GuestName", sql.NVarChar(200), body.guestName);
    updateRequest.input("MobileNo", sql.NVarChar(30), body.mobileNo ?? null);
    updateRequest.input("Email", sql.NVarChar(150), body.email ?? null);
    updateRequest.input("ArrivalDate", sql.Date, body.arrivalDate);
    updateRequest.input("DepartureDate", sql.Date, body.departureDate);
    updateRequest.input("Nights", sql.Int, nights);
    updateRequest.input("RoomType", sql.NVarChar(100), body.roomType);
    updateRequest.input("ReservedRoomId", sql.BigInt, body.reservedRoomId ?? null);
    updateRequest.input("Adults", sql.Int, Number(body.adults ?? 1));
    updateRequest.input("Children", sql.Int, Number(body.children ?? 0));
    updateRequest.input("BoardBasisId", sql.Int, body.boardBasisId);
    updateRequest.input("AdvancePayment", sql.Decimal(18, 2), Number(body.advancePayment ?? 0));
    updateRequest.input("TotalEstimate", sql.Decimal(18, 2), Number(body.totalEstimate ?? 0));
    updateRequest.input("ReservationStatus", sql.NVarChar(20), body.reservationStatus);
    updateRequest.input("Note", sql.NVarChar(1000), body.note ?? null);
    updateRequest.input("UpdatedByUserId", sql.Numeric(18, 0), body.updatedByUserId ?? null);

    await updateRequest.query(
      `
      UPDATE r
      SET guest_name = @GuestName,
          mobile_no = @MobileNo,
          email = @Email,
          arrival_date = @ArrivalDate,
          departure_date = @DepartureDate,
          nights = @Nights,
          room_type = @RoomType,
          reserved_room_id = @ReservedRoomId,
          adults = @Adults,
          children = @Children,
          board_basis_id = @BoardBasisId,
          board_basis = bb.board_basis_name,
          advance_payment = @AdvancePayment,
          total_estimate = @TotalEstimate,
          reservation_status = @ReservationStatus,
          note = @Note,
          updated_at = SYSDATETIME(),
          updated_by_user_id = @UpdatedByUserId
      FROM hotel.reservation r
      INNER JOIN hotel.board_basis bb
          ON bb.board_basis_id = @BoardBasisId
      WHERE r.reservation_id = @ReservationId
      `
    );

    if (body.reservedRoomId && ["Tentative", "Confirmed"].includes(body.reservationStatus)) {
      await new sql.Request(transaction)
        .input("RoomId", sql.BigInt, body.reservedRoomId)
        .query(
          `
          UPDATE hotel.room
          SET current_status = CASE
                  WHEN current_status IN ('Vacant Ready', 'Reserved') THEN 'Reserved'
                  ELSE current_status
              END,
              updated_at = SYSDATETIME()
          WHERE room_id = @RoomId
          `
        );
    }

    if (previousRoomId && previousRoomId !== body.reservedRoomId) {
      const cleanupRequest = new sql.Request(transaction);
      cleanupRequest.input("OldRoomId", sql.BigInt, previousRoomId);

      await cleanupRequest.query(
        `
        IF NOT EXISTS (
            SELECT 1
            FROM hotel.reservation
            WHERE reserved_room_id = @OldRoomId
              AND reservation_status IN ('Tentative', 'Confirmed')
        )
        AND NOT EXISTS (
            SELECT 1
            FROM hotel.stay
            WHERE room_id = @OldRoomId
              AND stay_status IN ('Reserved', 'Checked In')
        )
        BEGIN
            UPDATE hotel.room
            SET current_status = CASE
                    WHEN current_status = 'Reserved' THEN 'Vacant Ready'
                    ELSE current_status
                END,
                updated_at = SYSDATETIME()
            WHERE room_id = @OldRoomId
        END
        `
      );
    }

    await transaction.commit();

    const readResult = await pool.request()
      .input("ReservationId", sql.BigInt, parsedReservationId)
      .query(
        `
        SELECT
            r.reservation_id AS reservationId,
            r.reservation_no AS reservationNo,
            r.guest_name AS guestName,
            r.mobile_no AS mobileNo,
            r.email,
            r.arrival_date AS arrivalDate,
            r.departure_date AS departureDate,
            r.nights,
            r.room_type AS roomType,
            r.reserved_room_id AS reservedRoomId,
            rm.room_no AS reservedRoomNo,
            r.adults,
            r.children,
            r.board_basis_id AS boardBasisId,
            bb.board_basis_name AS boardBasisName,
            r.advance_payment AS advancePayment,
            r.total_estimate AS totalEstimate,
            r.reservation_status AS reservationStatus,
            r.note,
            r.created_at AS createdAt
        FROM hotel.reservation r
        LEFT JOIN hotel.room rm
            ON rm.room_id = r.reserved_room_id
        LEFT JOIN hotel.board_basis bb
            ON bb.board_basis_id = r.board_basis_id
        WHERE r.reservation_id = @ReservationId
        `
      );

    return NextResponse.json({
      success: true,
      data: readResult.recordset[0] ?? null,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("PUT /api/reservations/[reservationId] failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update reservation.",
      },
      { status: 500 }
    );
  }
}
