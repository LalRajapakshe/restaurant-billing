import { NextRequest, NextResponse } from "next/server";

import { mockRooms } from "@/data/mock-rooms";
import { RoomPayload } from "@/types/room";

function calculateNights(arrivalDate: string, departureDate: string) {
  const start = new Date(arrivalDate);
  const end = new Date(departureDate);
  const diff = end.getTime() - start.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  return Number.isFinite(days) && days > 0 ? days : 0;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockRooms,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as RoomPayload;
  const nextId = body.id ?? `RM-${100 + mockRooms.length + 1}`;

  const saved = {
    id: nextId,
    roomNo: body.roomNo ?? "",
    roomType: body.roomType ?? "",
    floor: body.floor ?? "",
    rate: Number(body.rate ?? 0),
    status: body.status ?? "Vacant Ready",
    reservationId: body.reservationId ?? "",
    guestName: body.guestName ?? "",
    mobile: body.mobile ?? "",
    arrivalDate: body.arrivalDate ?? "",
    departureDate: body.departureDate ?? "",
    nights: calculateNights(body.arrivalDate ?? "", body.departureDate ?? ""),
    adults: Number(body.adults ?? 0),
    children: Number(body.children ?? 0),
    boardBasis: body.boardBasis ?? "Room Only",
    notes: body.notes ?? "",
    housekeepingNote: body.housekeepingNote ?? "",
    lastCleanedBy: body.lastCleanedBy ?? "",
  };

  return NextResponse.json({
    success: true,
    message: "Mock room action accepted.",
    data: saved,
  });
}
