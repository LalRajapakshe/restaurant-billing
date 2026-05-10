import { NextResponse } from "next/server";
import { queryRows } from "@/lib/db-exec";

type OutletRow = {
  outletId: number;
  outletCode?: string | null;
  outletName: string;
  locationId?: number | null;
  sortOrder?: number | null;
  isActive?: boolean;
  note?: string | null;
};

export async function GET() {
  try {
    const rows = await queryRows<OutletRow>(
      `
      SELECT
          outlet_id AS outletId,
          outlet_code AS outletCode,
          outlet_name AS outletName,
          location_id AS locationId,
          sort_order AS sortOrder,
          is_active AS isActive,
          note
      FROM hotel.outlet
      WHERE ISNULL(is_active, 1) = 1
      ORDER BY ISNULL(sort_order, 9999), outlet_name
      `
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET /api/outlet failed", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load outlets.",
      },
      { status: 500 }
    );
  }
}
