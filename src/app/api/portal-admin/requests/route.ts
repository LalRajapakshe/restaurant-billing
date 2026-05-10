import { NextRequest, NextResponse } from "next/server";
import { getDbPool, sql } from "@/lib/db";

type PortalRequestRow = {
  portalReservationRequestId: number;
  requestReference: string;
  requestStatus: string;
  sourceMode: string;
  guestName: string;
  email: string;
  mobileNo: string;
  arrivalDate: string;
  departureDate: string;
  adults: number;
  children: number;
  hotelId: number;
  hotelName: string;
  tenantName?: string | null;
  roomTypeId?: number | null;
  roomTypeName?: string | null;
  ratePlanId?: number | null;
  ratePlanName?: string | null;
  convertedReservationId?: number | null;
  convertedAt?: string | null;
  createdAt: string;
};

export async function GET(request: NextRequest) {
  try {
    const pool = await getDbPool();
    const status = (request.nextUrl.searchParams.get("status") ?? "").trim();

    const result = await pool.request()
      .input("Status", sql.NVarChar(30), status)
      .query<PortalRequestRow>(
        `
        SELECT
            pr.portal_reservation_request_id AS portalReservationRequestId,
            pr.request_reference AS requestReference,
            pr.request_status AS requestStatus,
            pr.source_mode AS sourceMode,
            pr.guest_name AS guestName,
            pr.email,
            pr.mobile_no AS mobileNo,
            pr.arrival_date AS arrivalDate,
            pr.departure_date AS departureDate,
            pr.adults,
            pr.children,
            pr.hotel_id AS hotelId,
            hp.hotel_name AS hotelName,
            pt.tenant_name AS tenantName,
            pr.room_type_id AS roomTypeId,
            rt.room_type_name AS roomTypeName,
            pr.rate_plan_id AS ratePlanId,
            rp.rate_plan_name AS ratePlanName,
            pr.converted_reservation_id AS convertedReservationId,
            pr.converted_at AS convertedAt,
            pr.created_at AS createdAt
        FROM hotel.portal_reservation_request pr
        INNER JOIN hotel.hotel_property hp
            ON hp.hotel_id = pr.hotel_id
        LEFT JOIN hotel.platform_tenant pt
            ON pt.tenant_id = hp.tenant_id
        LEFT JOIN hotel.room_type rt
            ON rt.room_type_id = pr.room_type_id
        LEFT JOIN hotel.rate_plan rp
            ON rp.rate_plan_id = pr.rate_plan_id
        WHERE @Status = '' OR pr.request_status = @Status
        ORDER BY pr.created_at DESC, pr.portal_reservation_request_id DESC
        `
      );

    return NextResponse.json({
      success: true,
      data: result.recordset ?? [],
    });
  } catch (error) {
    console.error("GET /api/portal-admin/requests failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to load portal reservation requests." },
      { status: 500 }
    );
  }
}
