import { NextRequest, NextResponse } from "next/server";

import { executeProcedure, sql } from "@/lib/db-exec";

type FolioByRoomRouteContext = {
  params: Promise<{ roomId: string }>;
};

function parseRoomId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(
  request: NextRequest,
  { params }: FolioByRoomRouteContext
) {
  try {
    const { roomId } = await params;
    const parsedRoomId = parseRoomId(roomId);

    if (!parsedRoomId) {
      return NextResponse.json(
        { success: false, error: "Invalid room id." },
        { status: 400 }
      );
    }

    const result = await executeProcedure("hotel.sp_folio_get_by_room", [
      { name: "RoomId", type: sql.BigInt, value: parsedRoomId },
    ]);

    const summary = result.recordsets?.[0]?.[0] ?? null;
    const entries = result.recordsets?.[1] ?? [];

    return NextResponse.json({
      success: true,
      data: summary ? { ...summary, entries } : null,
    });
  } catch (error) {
    console.error("GET /api/folios/by-room/[roomId] failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load folio by room.",
      },
      { status: 500 }
    );
  }
}
