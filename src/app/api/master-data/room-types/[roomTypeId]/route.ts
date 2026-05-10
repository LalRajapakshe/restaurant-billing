import { NextRequest, NextResponse } from "next/server";
import { executeQuery, queryRows, sql } from "@/lib/db-exec";

type RouteContext = {
  params: Promise<{ roomTypeId: string }>;
};

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { roomTypeId } = await params;
    const id = Number(roomTypeId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "Invalid room type id." }, { status: 400 });
    }

    const body = (await request.json()) as {
      roomTypeCode: string;
      roomTypeName: string;
      standardRate: number;
      sortOrder: number;
      isActive: boolean;
      note?: string | null;
    };

    await executeQuery(
      `
      UPDATE hotel.room_type
      SET room_type_code = @RoomTypeCode,
          room_type_name = @RoomTypeName,
          standard_rate = @StandardRate,
          sort_order = @SortOrder,
          is_active = @IsActive,
          note = @Note,
          updated_at = SYSDATETIME()
      WHERE room_type_id = @RoomTypeId
      `,
      [
        { name: "RoomTypeId", type: sql.BigInt, value: id },
        { name: "RoomTypeCode", type: sql.NVarChar(30), value: body.roomTypeCode.trim() },
        { name: "RoomTypeName", type: sql.NVarChar(100), value: body.roomTypeName.trim() },
        { name: "StandardRate", type: sql.Decimal(18, 2), value: Number(body.standardRate ?? 0) },
        { name: "SortOrder", type: sql.Int, value: Number(body.sortOrder ?? 1) },
        { name: "IsActive", type: sql.Bit, value: Boolean(body.isActive) },
        { name: "Note", type: sql.NVarChar(500), value: body.note ?? null },
      ]
    );

    const rows = await queryRows(
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
      WHERE room_type_id = @RoomTypeId
      `,
      [{ name: "RoomTypeId", type: sql.BigInt, value: id }]
    );

    return NextResponse.json({ success: true, data: rows[0] ?? null });
  } catch (error) {
    console.error("PUT /api/master-data/room-types/[roomTypeId] failed", error);
    return NextResponse.json({ success: false, error: "Failed to update room type." }, { status: 500 });
  }
}
