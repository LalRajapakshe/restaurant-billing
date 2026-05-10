import { NextRequest, NextResponse } from "next/server";
import { queryRows, sql } from "@/lib/db-exec";

type RequestInsertRow = {
  portalReservationRequestId: number;
  requestReference: string;
  requestStatus: string;
};

function makeReference() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `PRQ${stamp}${suffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const hotelId = Number(body.hotelId ?? 0);
    const guestName = String(body.guestName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const mobileNo = String(body.mobileNo ?? "").trim();
    const arrivalDate = String(body.arrivalDate ?? "").trim();
    const departureDate = String(body.departureDate ?? "").trim();
    const adults = Number(body.adults ?? 1);
    const children = Number(body.children ?? 0);
    const roomTypeId = body.roomTypeId ? Number(body.roomTypeId) : null;
    const ratePlanId = body.ratePlanId ? Number(body.ratePlanId) : null;
    const notes = String(body.notes ?? "").trim() || null;
    const sourceMode = String(body.sourceMode ?? "hotel-portal").trim() || "hotel-portal";

    if (!hotelId || !guestName || !email || !mobileNo || !arrivalDate || !departureDate) {
      return NextResponse.json(
        { success: false, error: "Hotel, guest, email, mobile, and stay dates are required." },
        { status: 400 }
      );
    }

    const requestReference = makeReference();

    const inserted = await queryRows<RequestInsertRow>(
      `
      INSERT INTO hotel.portal_reservation_request (
          hotel_id,
          source_mode,
          guest_name,
          email,
          mobile_no,
          arrival_date,
          departure_date,
          adults,
          children,
          room_type_id,
          rate_plan_id,
          notes,
          request_reference
      )
      OUTPUT
          inserted.portal_reservation_request_id AS portalReservationRequestId,
          inserted.request_reference AS requestReference,
          inserted.request_status AS requestStatus
      VALUES (
          @HotelId,
          @SourceMode,
          @GuestName,
          @Email,
          @MobileNo,
          @ArrivalDate,
          @DepartureDate,
          @Adults,
          @Children,
          @RoomTypeId,
          @RatePlanId,
          @Notes,
          @RequestReference
      )
      `,
      [
        { name: "HotelId", type: sql.BigInt, value: hotelId },
        { name: "SourceMode", type: sql.NVarChar(30), value: sourceMode },
        { name: "GuestName", type: sql.NVarChar(200), value: guestName },
        { name: "Email", type: sql.NVarChar(200), value: email },
        { name: "MobileNo", type: sql.NVarChar(50), value: mobileNo },
        { name: "ArrivalDate", type: sql.Date, value: arrivalDate },
        { name: "DepartureDate", type: sql.Date, value: departureDate },
        { name: "Adults", type: sql.Int, value: adults },
        { name: "Children", type: sql.Int, value: children },
        { name: "RoomTypeId", type: sql.BigInt, value: roomTypeId },
        { name: "RatePlanId", type: sql.BigInt, value: ratePlanId },
        { name: "Notes", type: sql.NVarChar(1000), value: notes },
        { name: "RequestReference", type: sql.NVarChar(40), value: requestReference },
      ]
    );

    return NextResponse.json({
      success: true,
      data: inserted[0] ?? {
        portalReservationRequestId: 0,
        requestReference,
        requestStatus: "Pending",
      },
    });
  } catch (error) {
    console.error("POST /api/public/reservation-requests failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to save reservation request." },
      { status: 500 }
    );
  }
}
