import { NextRequest, NextResponse } from "next/server";

import { getDbPool, sql } from "@/lib/db";

type ReservationRow = {
  reservationId: number;
  reservationNo: string;
};

function generateReservationNo() {
  return `RES-${Date.now()}`;
}

function dateDiffNights(arrivalDate: string, departureDate: string) {
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  const diff = departure.getTime() - arrival.getTime();
  return Math.round(diff / 86400000);
}

export async function GET() {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(
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
      ORDER BY r.created_at DESC, r.reservation_id DESC
      `
    );

    return NextResponse.json({
      success: true,
      data: result.recordset ?? [],
    });
  } catch (error) {
    console.error("GET /api/reservations failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load reservations.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    reservationNo?: string;
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
    createdByUserId?: number | null;
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

    const insertRequest = new sql.Request(transaction);
    insertRequest.input("ReservationNo", sql.NVarChar(30), body.reservationNo || generateReservationNo());
    insertRequest.input("GuestName", sql.NVarChar(200), body.guestName);
    insertRequest.input("MobileNo", sql.NVarChar(30), body.mobileNo ?? null);
    insertRequest.input("Email", sql.NVarChar(150), body.email ?? null);
    insertRequest.input("ArrivalDate", sql.Date, body.arrivalDate);
    insertRequest.input("DepartureDate", sql.Date, body.departureDate);
    insertRequest.input("Nights", sql.Int, nights);
    insertRequest.input("RoomType", sql.NVarChar(100), body.roomType);
    insertRequest.input("ReservedRoomId", sql.BigInt, body.reservedRoomId ?? null);
    insertRequest.input("Adults", sql.Int, Number(body.adults ?? 1));
    insertRequest.input("Children", sql.Int, Number(body.children ?? 0));
    insertRequest.input("BoardBasisId", sql.Int, body.boardBasisId);
    insertRequest.input("AdvancePayment", sql.Decimal(18, 2), Number(body.advancePayment ?? 0));
    insertRequest.input("TotalEstimate", sql.Decimal(18, 2), Number(body.totalEstimate ?? 0));
    insertRequest.input("ReservationStatus", sql.NVarChar(20), body.reservationStatus);
    insertRequest.input("Note", sql.NVarChar(1000), body.note ?? null);
    insertRequest.input("CreatedByUserId", sql.Numeric(18, 0), body.createdByUserId ?? null);

    const insertResult = await insertRequest.query<ReservationRow>(
      `
      INSERT INTO hotel.reservation (
          reservation_no,
          guest_name,
          mobile_no,
          email,
          arrival_date,
          departure_date,
          nights,
          room_type,
          reserved_room_id,
          adults,
          children,
          board_basis_id,
          board_basis,
          advance_payment,
          total_estimate,
          reservation_status,
          note,
          created_by_user_id
      )
      OUTPUT INSERTED.reservation_id AS reservationId, INSERTED.reservation_no AS reservationNo
      SELECT
          @ReservationNo,
          @GuestName,
          @MobileNo,
          @Email,
          @ArrivalDate,
          @DepartureDate,
          @Nights,
          @RoomType,
          @ReservedRoomId,
          @Adults,
          @Children,
          @BoardBasisId,
          bb.board_basis_name,
          @AdvancePayment,
          @TotalEstimate,
          @ReservationStatus,
          @Note,
          @CreatedByUserId
      FROM hotel.board_basis bb
      WHERE bb.board_basis_id = @BoardBasisId
      `
    );

    const created = insertResult.recordset[0];

    if (body.reservedRoomId && ["Tentative", "Confirmed"].includes(body.reservationStatus)) {
      const roomRequest = new sql.Request(transaction);
      roomRequest.input("RoomId", sql.BigInt, body.reservedRoomId);
      await roomRequest.query(
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

    await transaction.commit();

    const readResult = await pool.request()
      .input("ReservationId", sql.BigInt, Number(created.reservationId))
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
    console.error("POST /api/reservations failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create reservation.",
      },
      { status: 500 }
    );
  }
}
