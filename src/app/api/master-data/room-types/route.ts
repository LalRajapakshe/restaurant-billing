import { NextRequest, NextResponse } from "next/server";
import { executeQuery, queryRows, sql } from "@/lib/db-exec";

type RoomTypeRow = {
  roomTypeId: number;
  roomTypeCode: string;
  roomTypeName: string;
  standardRate: number;
  sortOrder: number;
  isActive: boolean;
  note?: string | null;
};

export async function GET() {
  try {
    const rows = await queryRows<RoomTypeRow>(
      `
      SELECT
          room_type_id AS roomTypeId,
          room_type_code AS roomTypeCode,
          room_type_name AS roomTypeName,
          standard_rate AS standardRate,
          sort_order AS sortOrder,
          is_active AS isActive,
          note
      FROM hotel.room_type
      ORDER BY sort_order, room_type_name
      `
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("GET /api/master-data/room-types failed", error);
    return NextResponse.json({ success: false, error: "Failed to load room types." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      roomTypeCode: string;
      roomTypeName: string;
      standardRate: number;
      sortOrder: number;
      isActive: boolean;
      note?: string | null;
    };

    const result = await executeQuery<RoomTypeRow>(
      `
      INSERT INTO hotel.room_type (
          room_type_code,
          room_type_name,
          standard_rate,
          sort_order,
          is_active,
          note
      )
      OUTPUT
          INSERTED.room_type_id AS roomTypeId,
          INSERTED.room_type_code AS roomTypeCode,
          INSERTED.room_type_name AS roomTypeName,
          INSERTED.standard_rate AS standardRate,
          INSERTED.sort_order AS sortOrder,
          INSERTED.is_active AS isActive,
          INSERTED.note AS note
      VALUES (
          @RoomTypeCode,
          @RoomTypeName,
          @StandardRate,
          @SortOrder,
          @IsActive,
          @Note
      )
      `,
      [
        { name: "RoomTypeCode", type: sql.NVarChar(30), value: body.roomTypeCode.trim() },
        { name: "RoomTypeName", type: sql.NVarChar(100), value: body.roomTypeName.trim() },
        { name: "StandardRate", type: sql.Decimal(18, 2), value: Number(body.standardRate ?? 0) },
        { name: "SortOrder", type: sql.Int, value: Number(body.sortOrder ?? 1) },
        { name: "IsActive", type: sql.Bit, value: Boolean(body.isActive) },
        { name: "Note", type: sql.NVarChar(500), value: body.note ?? null },
      ]
    );

    return NextResponse.json({ success: true, data: result.recordset[0] ?? null });
  } catch (error) {
    console.error("POST /api/master-data/room-types failed", error);
    return NextResponse.json({ success: false, error: "Failed to create room type." }, { status: 500 });
  }
}
