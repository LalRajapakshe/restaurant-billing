import { NextRequest, NextResponse } from "next/server";
import { getDbPool, sql } from "@/lib/db";

type PortalRequestSource = {
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
  notes?: string | null;
  hotelId: number;
  roomTypeId?: number | null;
  roomTypeName?: string | null;
  ratePlanId?: number | null;
  boardBasisId?: number | null;
  boardBasisName?: string | null;
};

type ReservationInsertRow = {
  reservationId: number;
  reservationNo: string;
};

function generateReservationNo() {
  return `WEB-${Date.now()}`;
}

function dateDiffNights(arrivalDate: string, departureDate: string) {
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  const diff = departure.getTime() - arrival.getTime();
  return Math.round(diff / 86400000);
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const portalRequestId = Number(requestId);

  if (!Number.isFinite(portalRequestId) || portalRequestId <= 0) {
    return NextResponse.json(
      { success: false, error: "Invalid portal request id." },
      { status: 400 }
    );
  }

  const pool = await getDbPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const sourceRequest = new sql.Request(transaction);
    sourceRequest.input("PortalRequestId", sql.BigInt, portalRequestId);

    const sourceResult = await sourceRequest.query<PortalRequestSource>(
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
          pr.notes,
          pr.hotel_id AS hotelId,
          pr.room_type_id AS roomTypeId,
          rt.room_type_name AS roomTypeName,
          pr.rate_plan_id AS ratePlanId,
          rp.board_basis_id AS boardBasisId,
          bb.board_basis_name AS boardBasisName
      FROM hotel.portal_reservation_request pr
      LEFT JOIN hotel.room_type rt
          ON rt.room_type_id = pr.room_type_id
      LEFT JOIN hotel.rate_plan rp
          ON rp.rate_plan_id = pr.rate_plan_id
      LEFT JOIN hotel.board_basis bb
          ON bb.board_basis_id = rp.board_basis_id
      WHERE pr.portal_reservation_request_id = @PortalRequestId
      `
    );

    const source = sourceResult.recordset[0];

    if (!source) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, error: "Portal request not found." },
        { status: 404 }
      );
    }

    if (source.requestStatus !== "Pending") {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, error: "Only pending requests can be converted." },
        { status: 400 }
      );
    }

    if (!source.roomTypeId || !source.roomTypeName || !source.ratePlanId) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, error: "Portal request is missing room type or rate plan." },
        { status: 400 }
      );
    }

    const nights = dateDiffNights(source.arrivalDate, source.departureDate);
    if (!Number.isFinite(nights) || nights <= 0) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, error: "Invalid arrival/departure date range." },
        { status: 400 }
      );
    }

    let boardBasisId = source.boardBasisId ?? null;
    let boardBasisName = source.boardBasisName ?? null;

    if (!boardBasisId || !boardBasisName) {
      const defaultBoardRequest = new sql.Request(transaction);
      const defaultBoard = await defaultBoardRequest.query<{ boardBasisId: number; boardBasisName: string }>(
        `
        SELECT TOP (1)
            board_basis_id AS boardBasisId,
            board_basis_name AS boardBasisName
        FROM hotel.board_basis
        ORDER BY board_basis_id
        `
      );

      boardBasisId = defaultBoard.recordset[0]?.boardBasisId ?? null;
      boardBasisName = defaultBoard.recordset[0]?.boardBasisName ?? null;
    }

    if (!boardBasisId || !boardBasisName) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, error: "Board basis setup is missing." },
        { status: 400 }
      );
    }

    const rateRequest = new sql.Request(transaction);
    rateRequest.input("RatePlanId", sql.BigInt, source.ratePlanId);
    rateRequest.input("ArrivalDate", sql.Date, source.arrivalDate);

    const rateResult = await rateRequest.query<{ nightlyRate: number | null }>(
      `
      SELECT TOP (1)
          double_rate AS nightlyRate
      FROM hotel.rate_plan_price
      WHERE rate_plan_id = @RatePlanId
        AND business_date = @ArrivalDate
        AND is_closed = 0
      `
    );

    const nightlyRate = Number(rateResult.recordset[0]?.nightlyRate ?? 0);
    const totalEstimate = nightlyRate > 0 ? nightlyRate * nights : 0;
    const reservationNo = generateReservationNo();

    const insertRequest = new sql.Request(transaction);
    insertRequest.input("ReservationNo", sql.NVarChar(30), reservationNo);
    insertRequest.input("GuestName", sql.NVarChar(200), source.guestName);
    insertRequest.input("MobileNo", sql.NVarChar(30), source.mobileNo ?? null);
    insertRequest.input("Email", sql.NVarChar(150), source.email ?? null);
    insertRequest.input("ArrivalDate", sql.Date, source.arrivalDate);
    insertRequest.input("DepartureDate", sql.Date, source.departureDate);
    insertRequest.input("Nights", sql.Int, nights);
    insertRequest.input("RoomType", sql.NVarChar(100), source.roomTypeName);
    insertRequest.input("Adults", sql.Int, Number(source.adults ?? 1));
    insertRequest.input("Children", sql.Int, Number(source.children ?? 0));
    insertRequest.input("BoardBasisId", sql.Int, Number(boardBasisId));
    insertRequest.input("BoardBasis", sql.NVarChar(100), boardBasisName);
    insertRequest.input("AdvancePayment", sql.Decimal(18, 2), 0);
    insertRequest.input("TotalEstimate", sql.Decimal(18, 2), totalEstimate);
    insertRequest.input("ReservationStatus", sql.NVarChar(20), "Confirmed");
    insertRequest.input("Note", sql.NVarChar(1000), source.notes ?? null);
    insertRequest.input("HotelId", sql.BigInt, source.hotelId);
    insertRequest.input("BookingSource", sql.NVarChar(30), source.sourceMode || "hotel-portal");
    insertRequest.input("ExternalReference", sql.NVarChar(40), source.requestReference);
    insertRequest.input("PortalRequestId", sql.BigInt, source.portalReservationRequestId);
    insertRequest.input("RatePlanId", sql.BigInt, source.ratePlanId);

    const insertResult = await insertRequest.query<ReservationInsertRow>(
      `
      INSERT INTO hotel.reservation (
          reservation_no,
          guest_name,
          mobile_no,
          email,
          arrival_date,
          departure_date,
          nights,
          room_type,
          reserved_room_id,
          adults,
          children,
          board_basis_id,
          board_basis,
          advance_payment,
          total_estimate,
          reservation_status,
          note,
          created_by_user_id,
          hotel_id,
          booking_source,
          external_reference,
          portal_request_id,
          rate_plan_id
      )
      OUTPUT
          INSERTED.reservation_id AS reservationId,
          INSERTED.reservation_no AS reservationNo
      VALUES (
          @ReservationNo,
          @GuestName,
          @MobileNo,
          @Email,
          @ArrivalDate,
          @DepartureDate,
          @Nights,
          @RoomType,
          NULL,
          @Adults,
          @Children,
          @BoardBasisId,
          @BoardBasis,
          @AdvancePayment,
          @TotalEstimate,
          @ReservationStatus,
          @Note,
          NULL,
          @HotelId,
          @BookingSource,
          @ExternalReference,
          @PortalRequestId,
          @RatePlanId
      )
      `
    );

    const created = insertResult.recordset[0];

    const updateRequest = new sql.Request(transaction);
    updateRequest.input("PortalRequestId", sql.BigInt, portalRequestId);
    updateRequest.input("ReservationId", sql.BigInt, Number(created.reservationId));

    await updateRequest.query(
      `
      UPDATE hotel.portal_reservation_request
      SET request_status = 'Converted',
          converted_reservation_id = @ReservationId,
          converted_at = SYSDATETIME()
      WHERE portal_reservation_request_id = @PortalRequestId
      `
    );

    await transaction.commit();

    return NextResponse.json({
      success: true,
      data: {
        reservationId: Number(created.reservationId),
        reservationNo: created.reservationNo,
        portalRequestId,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("POST /api/portal-admin/requests/[requestId]/confirm failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to convert portal request into reservation." },
      { status: 500 }
    );
  }
}
