import { NextRequest, NextResponse } from "next/server";
import { executeQuery, queryRows, sql } from "@/lib/db-exec";

type RestaurantTableIdRow = {
  restaurantTableId?: number;
};

export async function GET() {
  try {
    const rows = await queryRows(`
      SELECT t.restaurant_table_id AS restaurantTableId, t.outlet_id AS outletId, o.outlet_name AS outletName, t.table_code AS tableCode, t.table_name AS tableName, t.seat_count AS seatCount, t.sort_order AS sortOrder, t.is_active AS isActive, t.note
      FROM hotel.restaurant_table t
      INNER JOIN hotel.outlet o ON o.outlet_id = t.outlet_id
      ORDER BY o.sort_order, o.outlet_name, t.sort_order, t.table_name
    `);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("GET /api/master-data/restaurant-tables failed", error);
    return NextResponse.json({ success: false, error: "Failed to load restaurant tables." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      outletId: number;
      tableCode: string;
      tableName: string;
      seatCount: number;
      sortOrder: number;
      isActive: boolean;
      note?: string | null;
    };

    const result = await executeQuery(
      `
      INSERT INTO hotel.restaurant_table (outlet_id, table_code, table_name, seat_count, sort_order, is_active, note)
      OUTPUT INSERTED.restaurant_table_id AS restaurantTableId
      VALUES (@OutletId, @TableCode, @TableName, @SeatCount, @SortOrder, @IsActive, @Note)
      `,
      [
        { name: "OutletId", type: sql.BigInt, value: Number(body.outletId) },
        { name: "TableCode", type: sql.NVarChar(30), value: body.tableCode.trim() },
        { name: "TableName", type: sql.NVarChar(60), value: body.tableName.trim() },
        { name: "SeatCount", type: sql.Int, value: Number(body.seatCount ?? 0) },
        { name: "SortOrder", type: sql.Int, value: Number(body.sortOrder ?? 1) },
        { name: "IsActive", type: sql.Bit, value: Boolean(body.isActive) },
        { name: "Note", type: sql.NVarChar(500), value: body.note ?? null },
      ]
    );

    const idRow = (result.recordset?.[0] ?? null) as RestaurantTableIdRow | null;
    const id = Number(idRow?.restaurantTableId ?? 0);

    const rows = await queryRows(
      `
      SELECT t.restaurant_table_id AS restaurantTableId, t.outlet_id AS outletId, o.outlet_name AS outletName, t.table_code AS tableCode, t.table_name AS tableName, t.seat_count AS seatCount, t.sort_order AS sortOrder, t.is_active AS isActive, t.note
      FROM hotel.restaurant_table t
      INNER JOIN hotel.outlet o ON o.outlet_id = t.outlet_id
      WHERE t.restaurant_table_id = @RestaurantTableId
      `,
      [{ name: "RestaurantTableId", type: sql.BigInt, value: id }]
    );

    return NextResponse.json({ success: true, data: rows[0] ?? null });
  } catch (error) {
    console.error("POST /api/master-data/restaurant-tables failed", error);
    return NextResponse.json({ success: false, error: "Failed to create restaurant table." }, { status: 500 });
  }
}
