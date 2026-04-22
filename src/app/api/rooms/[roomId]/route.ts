import { NextRequest, NextResponse } from "next/server";

import { mockRooms } from "@/data/mock-rooms";
import { RoomPayload } from "@/types/room";

type RoomRouteContext = {
  params: Promise<{ roomId: string }>;
};

function calculateNights(arrivalDate: string, departureDate: string) {
  const start = new Date(arrivalDate);
  const end = new Date(departureDate);
  const diff = end.getTime() - start.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  return Number.isFinite(days) && days > 0 ? days : 0;
}

export async function GET(
  request: NextRequest,
  { params }: RoomRouteContext
) {
  const { roomId } = await params;
  const room = mockRooms.find((item) => item.id === roomId);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: room,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: RoomRouteContext
) {
  const { roomId } = await params;
  const current = mockRooms.find((item) => item.id === roomId);
  const body = (await request.json().catch(() => ({}))) as RoomPayload;

  if (!current) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const updated = {
    ...current,
    ...body,
    id: roomId,
    nights: calculateNights(
      body.arrivalDate ?? current.arrivalDate,
      body.departureDate ?? current.departureDate
    ),
  };

  return NextResponse.json({
    success: true,
    message: "Mock room update accepted.",
    data: updated,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: RoomRouteContext
) {
  const { roomId } = await params;

  return NextResponse.json({
    success: true,
    message: "Mock room delete accepted.",
    data: { id: roomId },
  });
}
