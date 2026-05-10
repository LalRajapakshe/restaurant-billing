import { NextRequest, NextResponse } from "next/server";
import { executeQuery, queryRows, sql } from "@/lib/db-exec";

type RoomIdRow = {
  roomId?: number;
};

export async function GET() {
  try {
    const rows = await queryRows(
      `
      SELECT
          r.room_id AS roomId,
          r.room_no AS roomNo,
          r.room_type_id AS roomTypeId,
          rt.room_type_code AS roomTypeCode,
          COALESCE(rt.room_type_name, r.room_type) AS roomTypeName,
          r.floor_name AS floorName,
          r.default_rate AS defaultRate,
          r.current_status AS currentStatus,
          ISNULL(r.is_active, 1) AS isActive,
          r.note
      FROM hotel.room r
      LEFT JOIN hotel.room_type rt
          ON rt.room_type_id = r.room_type_id
      ORDER BY r.floor_name, r.room_no
      `
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("GET /api/master-data/rooms failed", error);
    return NextResponse.json({ success: false, error: "Failed to load rooms." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      roomNo: string;
      roomTypeId: number;
      floorName: string;
      defaultRate: number;
      currentStatus: string;
      isActive: boolean;
      note?: string | null;
    };

    const roomTypeRows = await queryRows<{ roomTypeName: string }>(
      `
      SELECT room_type_name AS roomTypeName
      FROM hotel.room_type
      WHERE room_type_id = @RoomTypeId
      `,
      [{ name: "RoomTypeId", type: sql.BigInt, value: Number(body.roomTypeId) }]
    );

    const roomTypeName = roomTypeRows[0]?.roomTypeName ?? "Standard";

    const result = await executeQuery(
      `
      INSERT INTO hotel.room (
          room_no,
          room_type_id,
          room_type,
          floor_name,
          default_rate,
          current_status,
          is_active,
          note
      )
      OUTPUT INSERTED.room_id AS roomId
      VALUES (
          @RoomNo,
          @RoomTypeId,
          @RoomTypeName,
          @FloorName,
          @DefaultRate,
          @CurrentStatus,
          @IsActive,
          @Note
      )
      `,
      [
        { name: "RoomNo", type: sql.NVarChar(20), value: body.roomNo.trim() },
        { name: "RoomTypeId", type: sql.BigInt, value: Number(body.roomTypeId) },
        { name: "RoomTypeName", type: sql.NVarChar(100), value: roomTypeName },
        { name: "FloorName", type: sql.NVarChar(60), value: body.floorName.trim() },
        { name: "DefaultRate", type: sql.Decimal(18, 2), value: Number(body.defaultRate ?? 0) },
        { name: "CurrentStatus", type: sql.NVarChar(30), value: body.currentStatus },
        { name: "IsActive", type: sql.Bit, value: Boolean(body.isActive) },
        { name: "Note", type: sql.NVarChar(500), value: body.note ?? null },
      ]
    );

    const idRow = (result.recordset?.[0] ?? null) as RoomIdRow | null;
    const id = Number(idRow?.roomId ?? 0);

    const rows = await queryRows(
      `
      SELECT
          r.room_id AS roomId,
          r.room_no AS roomNo,
          r.room_type_id AS roomTypeId,
          rt.room_type_code AS roomTypeCode,
          COALESCE(rt.room_type_name, r.room_type) AS roomTypeName,
          r.floor_name AS floorName,
          r.default_rate AS defaultRate,
          r.current_status AS currentStatus,
          ISNULL(r.is_active, 1) AS isActive,
          r.note
      FROM hotel.room r
      LEFT JOIN hotel.room_type rt
          ON rt.room_type_id = r.room_type_id
      WHERE r.room_id = @RoomId
      `,
      [{ name: "RoomId", type: sql.BigInt, value: id }]
    );

    return NextResponse.json({ success: true, data: rows[0] ?? null });
  } catch (error) {
    console.error("POST /api/master-data/rooms failed", error);
    return NextResponse.json({ success: false, error: "Failed to create room." }, { status: 500 });
  }
}
