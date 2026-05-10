import { NextRequest, NextResponse } from "next/server";
import { executeQuery, queryRows, sql } from "@/lib/db-exec";

type RouteContext = { params: Promise<{ outletId: string }>; };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { outletId } = await params;
    const id = Number(outletId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "Invalid outlet id." }, { status: 400 });
    }
    const body = (await request.json()) as { outletCode: string; outletName: string; locationId?: number | null; sortOrder: number; isActive: boolean; note?: string | null; };
    await executeQuery(`
      UPDATE hotel.outlet
      SET outlet_code = @OutletCode, outlet_name = @OutletName, location_id = @LocationId, sort_order = @SortOrder, is_active = @IsActive, note = @Note, updated_at = SYSDATETIME()
      WHERE outlet_id = @OutletId
    `, [
      { name: "OutletId", type: sql.BigInt, value: id },
      { name: "OutletCode", type: sql.NVarChar(30), value: body.outletCode.trim() },
      { name: "OutletName", type: sql.NVarChar(100), value: body.outletName.trim() },
      { name: "LocationId", type: sql.BigInt, value: body.locationId ?? null },
      { name: "SortOrder", type: sql.Int, value: Number(body.sortOrder ?? 1) },
      { name: "IsActive", type: sql.Bit, value: Boolean(body.isActive) },
      { name: "Note", type: sql.NVarChar(500), value: body.note ?? null },
    ]);
    const rows = await queryRows(`
      SELECT outlet_id AS outletId, outlet_code AS outletCode, outlet_name AS outletName, location_id AS locationId, sort_order AS sortOrder, is_active AS isActive, note
      FROM hotel.outlet
      WHERE outlet_id = @OutletId
    `, [{ name: "OutletId", type: sql.BigInt, value: id }]);
    return NextResponse.json({ success: true, data: rows[0] ?? null });
  } catch (error) {
    console.error("PUT /api/master-data/outlets/[outletId] failed", error);
    return NextResponse.json({ success: false, error: "Failed to update outlet." }, { status: 500 });
  }
}
