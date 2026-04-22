import { NextRequest, NextResponse } from "next/server";

import { mockReservations } from "@/data/mock-reservations";
import { ReservationPayload } from "@/types/reservation";

type ReservationRouteContext = {
  params: Promise<{ reservationId: string }>;
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
  { params }: ReservationRouteContext
) {
  const { reservationId } = await params;
  const reservation = mockReservations.find((item) => item.id === reservationId);

  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: reservation,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: ReservationRouteContext
) {
  const { reservationId } = await params;
  const current = mockReservations.find((item) => item.id === reservationId);
  const body = (await request.json().catch(() => ({}))) as ReservationPayload;

  if (!current) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  const updated = {
    ...current,
    ...body,
    id: reservationId,
    nights: calculateNights(
      body.arrivalDate ?? current.arrivalDate,
      body.departureDate ?? current.departureDate
    ),
  };

  return NextResponse.json({
    success: true,
    message: "Mock reservation update accepted.",
    data: updated,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: ReservationRouteContext
) {
  const { reservationId } = await params;

  return NextResponse.json({
    success: true,
    message: "Mock reservation delete accepted.",
    data: { id: reservationId },
  });
}
