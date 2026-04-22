import { NextRequest, NextResponse } from "next/server";

import { mockReservations } from "@/data/mock-reservations";
import { ReservationPayload } from "@/types/reservation";

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
    data: mockReservations,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as ReservationPayload;
  const nextId = `RES-${10020 + mockReservations.length + 1}`;
  const saved = {
    id: nextId,
    guestName: body.guestName ?? "",
    mobile: body.mobile ?? "",
    email: body.email ?? "",
    arrivalDate: body.arrivalDate ?? "",
    departureDate: body.departureDate ?? "",
    nights: calculateNights(body.arrivalDate ?? "", body.departureDate ?? ""),
    roomType: body.roomType ?? "",
    roomNo: body.roomNo ?? "",
    adults: Number(body.adults ?? 1),
    children: Number(body.children ?? 0),
    boardBasis: body.boardBasis ?? "Room Only",
    advancePayment: Number(body.advancePayment ?? 0),
    totalEstimate: Number(body.totalEstimate ?? 0),
    status: body.status ?? "Tentative",
    notes: body.notes ?? "",
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    message: "Mock reservation accepted.",
    data: saved,
  });
}
