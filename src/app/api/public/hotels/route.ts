import { NextRequest, NextResponse } from "next/server";
import { getDbPool, sql } from "@/lib/db";

type PublicHotelRow = {
  hotelId: number;
  hotelCode: string;
  hotelSlug: string;
  hotelName: string;
  cityName?: string | null;
  countryName?: string | null;
  shortDescription?: string | null;
  defaultCurrencyCode: string;
  tenantCode?: string | null;
  tenantSlug?: string | null;
  tenantName?: string | null;
  publishedRoomTypes: number;
  startingRate: number | null;
};

function safeDate(raw?: string | null) {
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

export async function GET(request: NextRequest) {
  try {
    const pool = await getDbPool();
    const queryText = (request.nextUrl.searchParams.get("query") ?? "").trim();
    const tenantSlug = (request.nextUrl.searchParams.get("tenantSlug") ?? "").trim();
    const arrivalDate = safeDate(request.nextUrl.searchParams.get("arrivalDate"));

    const result = await pool.request()
      .input("QueryText", sql.NVarChar(200), queryText)
      .input("TenantSlug", sql.NVarChar(120), tenantSlug)
      .input("ArrivalDate", sql.Date, arrivalDate)
      .query<PublicHotelRow>(
        `
        SELECT
            hp.hotel_id AS hotelId,
            hp.hotel_code AS hotelCode,
            hp.hotel_slug AS hotelSlug,
            hp.hotel_name AS hotelName,
            hp.city_name AS cityName,
            hp.country_name AS countryName,
            hp.short_description AS shortDescription,
            hp.default_currency_code AS defaultCurrencyCode,
            pt.tenant_code AS tenantCode,
            pt.tenant_slug AS tenantSlug,
            pt.tenant_name AS tenantName,
            COUNT(DISTINCT hri.room_type_id) AS publishedRoomTypes,
            MIN(CASE
                  WHEN rpp.is_closed = 0 AND (@ArrivalDate IS NULL OR rpp.business_date = @ArrivalDate)
                  THEN rpp.double_rate
                  ELSE NULL
                END) AS startingRate
        FROM hotel.hotel_property hp
        LEFT JOIN hotel.platform_tenant pt
            ON pt.tenant_id = hp.tenant_id
        LEFT JOIN hotel.hotel_room_inventory hri
            ON hri.hotel_id = hp.hotel_id
           AND hri.is_published = 1
        LEFT JOIN hotel.rate_plan rp
            ON rp.hotel_id = hp.hotel_id
           AND rp.room_type_id = hri.room_type_id
           AND rp.is_active = 1
        LEFT JOIN hotel.rate_plan_price rpp
            ON rpp.rate_plan_id = rp.rate_plan_id
        WHERE hp.is_active = 1
          AND (
              @QueryText = ''
              OR hp.hotel_name LIKE '%' + @QueryText + '%'
              OR hp.city_name LIKE '%' + @QueryText + '%'
              OR hp.country_name LIKE '%' + @QueryText + '%'
          )
          AND (
              @TenantSlug = ''
              OR pt.tenant_slug = @TenantSlug
          )
        GROUP BY
            hp.hotel_id,
            hp.hotel_code,
            hp.hotel_slug,
            hp.hotel_name,
            hp.city_name,
            hp.country_name,
            hp.short_description,
            hp.default_currency_code,
            pt.tenant_code,
            pt.tenant_slug,
            pt.tenant_name
        ORDER BY hp.sort_order, hp.hotel_name
        `
      );

    return NextResponse.json({
      success: true,
      data: result.recordset ?? [],
    });
  } catch (error) {
    console.error("GET /api/public/hotels failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to load public hotel list." },
      { status: 500 }
    );
  }
}
