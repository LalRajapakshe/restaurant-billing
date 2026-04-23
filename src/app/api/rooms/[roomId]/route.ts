import { NextRequest, NextResponse } from "next/server";

import { executeProcedure, sql } from "@/lib/db-exec";

type RoomRouteContext = {
  params: Promise<{ roomId: string }>;
};

function parseRoomId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(
  request: NextRequest,
  { params }: RoomRouteContext
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

    const result = await executeProcedure("hotel.sp_room_get", [
      { name: "RoomId", type: sql.BigInt, value: parsedRoomId },
    ]);

    const room = result.recordset?.[0] ?? null;

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("GET /api/rooms/[roomId] failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load room.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RoomRouteContext
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

    const body = (await request.json()) as {
      roomType: string;
      floorName: string;
      defaultRate: number;
      currentStatus: string;
      notes?: string | null;
      housekeepingNote?: string | null;
      updatedByUserId?: number | null;
    };

    const result = await executeProcedure("hotel.sp_room_update", [
      { name: "RoomId", type: sql.BigInt, value: parsedRoomId },
      { name: "RoomType", type: sql.NVarChar(100), value: body.roomType },
      { name: "FloorName", type: sql.NVarChar(50), value: body.floorName },
      { name: "DefaultRate", type: sql.Decimal(18, 2), value: body.defaultRate },
      { name: "CurrentStatus", type: sql.NVarChar(30), value: body.currentStatus },
      { name: "Notes", type: sql.NVarChar(500), value: body.notes ?? null },
      {
        name: "HousekeepingNote",
        type: sql.NVarChar(500),
        value: body.housekeepingNote ?? null,
      },
      {
        name: "UpdatedByUserId",
        type: sql.Numeric(18, 0),
        value: body.updatedByUserId ?? null,
      },
    ]);

    return NextResponse.json({
      success: true,
      data: result.recordset?.[0] ?? null,
    });
  } catch (error) {
    console.error("PUT /api/rooms/[roomId] failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update room.",
      },
      { status: 500 }
    );
  }
}
