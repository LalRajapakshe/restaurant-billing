import { NextRequest, NextResponse } from "next/server";

import { executeProcedure, sql } from "@/lib/db-exec";

type FolioByStayRouteContext = {
  params: Promise<{ stayId: string }>;
};

function parseStayId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(
  request: NextRequest,
  { params }: FolioByStayRouteContext
) {
  try {
    const { stayId } = await params;
    const parsedStayId = parseStayId(stayId);

    if (!parsedStayId) {
      return NextResponse.json(
        { success: false, error: "Invalid stay id." },
        { status: 400 }
      );
    }

    const result = await executeProcedure("hotel.sp_folio_get_by_stay", [
      { name: "StayId", type: sql.BigInt, value: parsedStayId },
    ]);

    const summary = result.recordsets?.[0]?.[0] ?? null;
    const entries = result.recordsets?.[1] ?? [];

    return NextResponse.json({
      success: true,
      data: summary ? { ...summary, entries } : null,
    });
  } catch (error) {
    console.error("GET /api/folios/by-stay/[stayId] failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load folio by stay.",
      },
      { status: 500 }
    );
  }
}
