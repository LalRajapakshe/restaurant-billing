import { NextRequest, NextResponse } from "next/server";
import { executeQuery, queryRows, sql } from "@/lib/db-exec";

type RouteContext = { params: Promise<{ restaurantTableId: string }>; };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { restaurantTableId } = await params;
    const id = Number(restaurantTableId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "Invalid restaurant table id." }, { status: 400 });
    }
    const body = (await request.json()) as { outletId: number; tableCode: string; tableName: string; seatCount: number; sortOrder: number; isActive: boolean; note?: string | null; };
    await executeQuery(`
      UPDATE hotel.restaurant_table
      SET outlet_id = @OutletId, table_code = @TableCode, table_name = @TableName, seat_count = @SeatCount, sort_order = @SortOrder, is_active = @IsActive, note = @Note, updated_at = SYSDATETIME()
      WHERE restaurant_table_id = @RestaurantTableId
    `, [
      { name: "RestaurantTableId", type: sql.BigInt, value: id },
      { name: "OutletId", type: sql.BigInt, value: Number(body.outletId) },
      { name: "TableCode", type: sql.NVarChar(30), value: body.tableCode.trim() },
      { name: "TableName", type: sql.NVarChar(60), value: body.tableName.trim() },
      { name: "SeatCount", type: sql.Int, value: Number(body.seatCount ?? 0) },
      { name: "SortOrder", type: sql.Int, value: Number(body.sortOrder ?? 1) },
      { name: "IsActive", type: sql.Bit, value: Boolean(body.isActive) },
      { name: "Note", type: sql.NVarChar(500), value: body.note ?? null },
    ]);
    const rows = await queryRows(`
      SELECT t.restaurant_table_id AS restaurantTableId, t.outlet_id AS outletId, o.outlet_name AS outletName, t.table_code AS tableCode, t.table_name AS tableName, t.seat_count AS seatCount, t.sort_order AS sortOrder, t.is_active AS isActive, t.note
      FROM hotel.restaurant_table t
      INNER JOIN hotel.outlet o ON o.outlet_id = t.outlet_id
      WHERE t.restaurant_table_id = @RestaurantTableId
    `, [{ name: "RestaurantTableId", type: sql.BigInt, value: id }]);
    return NextResponse.json({ success: true, data: rows[0] ?? null });
  } catch (error) {
    console.error("PUT /api/master-data/restaurant-tables/[restaurantTableId] failed", error);
    return NextResponse.json({ success: false, error: "Failed to update restaurant table." }, { status: 500 });
  }
}
