import { NextRequest, NextResponse } from "next/server";
import { executeQuery, queryRows, sql } from "@/lib/db-exec";

export async function GET() {
  try {
    const rows = await queryRows(`
      SELECT outlet_id AS outletId, outlet_code AS outletCode, outlet_name AS outletName, location_id AS locationId, sort_order AS sortOrder, is_active AS isActive, note
      FROM hotel.outlet
      ORDER BY sort_order, outlet_name
    `);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("GET /api/master-data/outlets failed", error);
    return NextResponse.json({ success: false, error: "Failed to load outlets." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { outletCode: string; outletName: string; locationId?: number | null; sortOrder: number; isActive: boolean; note?: string | null; };
    const result = await executeQuery(`
      INSERT INTO hotel.outlet (outlet_code, outlet_name, location_id, sort_order, is_active, note)
      OUTPUT INSERTED.outlet_id AS outletId, INSERTED.outlet_code AS outletCode, INSERTED.outlet_name AS outletName, INSERTED.location_id AS locationId, INSERTED.sort_order AS sortOrder, INSERTED.is_active AS isActive, INSERTED.note AS note
      VALUES (@OutletCode, @OutletName, @LocationId, @SortOrder, @IsActive, @Note)
    `, [
      { name: "OutletCode", type: sql.NVarChar(30), value: body.outletCode.trim() },
      { name: "OutletName", type: sql.NVarChar(100), value: body.outletName.trim() },
      { name: "LocationId", type: sql.BigInt, value: body.locationId ?? null },
      { name: "SortOrder", type: sql.Int, value: Number(body.sortOrder ?? 1) },
      { name: "IsActive", type: sql.Bit, value: Boolean(body.isActive) },
      { name: "Note", type: sql.NVarChar(500), value: body.note ?? null },
    ]);
    return NextResponse.json({ success: true, data: result.recordset[0] ?? null });
  } catch (error) {
    console.error("POST /api/master-data/outlets failed", error);
    return NextResponse.json({ success: false, error: "Failed to create outlet." }, { status: 500 });
  }
}
