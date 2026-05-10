import { NextRequest, NextResponse } from "next/server";
import { queryRows, sql } from "@/lib/db-exec";

type HotelHeaderRow = {
  hotelId: number;
  hotelCode: string;
  hotelSlug: string;
  hotelName: string;
  cityName?: string | null;
  countryName?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  defaultCurrencyCode: string;
  bookingEmail?: string | null;
  bookingPhone?: string | null;
};

type RoomRateRow = {
  roomTypeId: number;
  roomTypeName: string;
  inventoryCount: number;
  maxAdults: number;
  maxChildren: number;
  ratePlanId: number;
  ratePlanCode: string;
  ratePlanName: string;
  boardBasisId?: number | null;
  boardBasisName?: string | null;
  cancellationSummary?: string | null;
  isRefundable: boolean;
  nightlyRate: number | null;
};

function safeDate(raw?: string | null) {
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotelSlug: string }> }
) {
  try {
    const { hotelSlug } = await params;
    const arrivalDate = safeDate(request.nextUrl.searchParams.get("arrivalDate"));

    const hotelRows = await queryRows<HotelHeaderRow>(
      `
      SELECT
          hotel_id AS hotelId,
          hotel_code AS hotelCode,
          hotel_slug AS hotelSlug,
          hotel_name AS hotelName,
          city_name AS cityName,
          country_name AS countryName,
          short_description AS shortDescription,
          full_description AS fullDescription,
          check_in_time AS checkInTime,
          check_out_time AS checkOutTime,
          default_currency_code AS defaultCurrencyCode,
          booking_email AS bookingEmail,
          booking_phone AS bookingPhone
      FROM hotel.hotel_property
      WHERE hotel_slug = @HotelSlug
        AND is_active = 1
      `,
      [{ name: "HotelSlug", type: sql.NVarChar(120), value: hotelSlug }]
    );

    const hotel = hotelRows[0];
    if (!hotel) {
      return NextResponse.json(
        { success: false, error: "Hotel not found." },
        { status: 404 }
      );
    }

    const roomRows = await queryRows<RoomRateRow>(
      `
      SELECT
          rt.room_type_id AS roomTypeId,
          rt.room_type_name AS roomTypeName,
          hri.inventory_count AS inventoryCount,
          hri.max_adults AS maxAdults,
          hri.max_children AS maxChildren,
          rp.rate_plan_id AS ratePlanId,
          rp.rate_plan_code AS ratePlanCode,
          rp.rate_plan_name AS ratePlanName,
          rp.board_basis_id AS boardBasisId,
          bb.board_basis_name AS boardBasisName,
          rp.cancellation_summary AS cancellationSummary,
          rp.is_refundable AS isRefundable,
          CASE
              WHEN @ArrivalDate IS NOT NULL THEN (
                  SELECT TOP (1) rpp.double_rate
                  FROM hotel.rate_plan_price rpp
                  WHERE rpp.rate_plan_id = rp.rate_plan_id
                    AND rpp.business_date = @ArrivalDate
                    AND rpp.is_closed = 0
              )
              ELSE (
                  SELECT TOP (1) rpp.double_rate
                  FROM hotel.rate_plan_price rpp
                  WHERE rpp.rate_plan_id = rp.rate_plan_id
                    AND rpp.is_closed = 0
                  ORDER BY rpp.business_date
              )
          END AS nightlyRate
      FROM hotel.hotel_room_inventory hri
      INNER JOIN hotel.room_type rt
          ON rt.room_type_id = hri.room_type_id
      INNER JOIN hotel.rate_plan rp
          ON rp.hotel_id = hri.hotel_id
         AND rp.room_type_id = hri.room_type_id
         AND rp.is_active = 1
      LEFT JOIN hotel.board_basis bb
          ON bb.board_basis_id = rp.board_basis_id
      WHERE hri.hotel_id = @HotelId
        AND hri.is_published = 1
      ORDER BY rt.room_type_name, rp.rate_plan_name
      `,
      [
        { name: "HotelId", type: sql.BigInt, value: hotel.hotelId },
        { name: "ArrivalDate", type: sql.Date, value: arrivalDate },
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        hotel,
        roomRates: roomRows,
      },
    });
  } catch (error) {
    console.error("GET /api/public/hotels/[hotelSlug] failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to load hotel booking portal." },
      { status: 500 }
    );
  }
}
