import { NextRequest, NextResponse } from "next/server";

import { executeProcedure, queryRows, sql } from "@/lib/db-exec";

function generateStayNo() {
  return `STY-${Date.now()}`;
}

export async function GET() {
  try {
    const rows = await queryRows(
      `
      SELECT
          s.stay_id AS stayId,
          s.stay_no AS stayNo,
          s.reservation_id AS reservationId,
          s.room_id AS roomId,
          r.room_no AS roomNo,
          r.room_type AS roomType,
          s.guest_name AS guestName,
          s.mobile_no AS mobileNo,
          s.check_in_date AS checkInDate,
          s.expected_check_out_date AS expectedCheckOutDate,
          s.actual_check_out_date AS actualCheckOutDate,
          s.nights,
          s.adults,
          s.children,
          s.board_basis_id AS boardBasisId,
          bb.board_basis_name AS boardBasisName,
          s.room_rate AS roomRate,
          s.stay_status AS stayStatus,
          s.note
      FROM hotel.stay s
      INNER JOIN hotel.room r
          ON r.room_id = s.room_id
      LEFT JOIN hotel.board_basis bb
          ON bb.board_basis_id = s.board_basis_id
      ORDER BY s.created_at DESC;
      `
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET /api/stays failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load stays.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      stayNo?: string;
      reservationId?: number | null;
      roomId: number;
      guestName: string;
      mobileNo?: string | null;
      checkInDate: string;
      expectedCheckOutDate: string;
      adults: number;
      children: number;
      boardBasisId: number;
      roomRate: number;
      note?: string | null;
      createdByUserId?: number | null;
    };

    const result = await executeProcedure("hotel.sp_stay_create", [
      {
        name: "StayNo",
        type: sql.NVarChar(30),
        value: body.stayNo || generateStayNo(),
      },
      {
        name: "ReservationId",
        type: sql.BigInt,
        value: body.reservationId ?? null,
      },
      { name: "RoomId", type: sql.BigInt, value: body.roomId },
      { name: "GuestName", type: sql.NVarChar(200), value: body.guestName },
      { name: "MobileNo", type: sql.NVarChar(30), value: body.mobileNo ?? null },
      { name: "CheckInDate", type: sql.Date, value: body.checkInDate },
      {
        name: "ExpectedCheckOutDate",
        type: sql.Date,
        value: body.expectedCheckOutDate,
      },
      { name: "Adults", type: sql.Int, value: body.adults },
      { name: "Children", type: sql.Int, value: body.children },
      { name: "BoardBasisId", type: sql.Int, value: body.boardBasisId },
      { name: "RoomRate", type: sql.Decimal(18, 2), value: body.roomRate },
      { name: "Note", type: sql.NVarChar(1000), value: body.note ?? null },
      {
        name: "CreatedByUserId",
        type: sql.Numeric(18, 0),
        value: body.createdByUserId ?? null,
      },
    ]);

    return NextResponse.json({
      success: true,
      data: result.recordset?.[0] ?? null,
    });
  } catch (error) {
    console.error("POST /api/stays failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create stay.",
      },
      { status: 500 }
    );
  }
}
