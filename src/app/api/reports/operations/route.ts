import { NextRequest, NextResponse } from "next/server";
import { queryRows, sql } from "@/lib/db-exec";

function resolvedDate(raw?: string | null) {
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : new Date().toISOString().slice(0, 10);
}

async function safeQueryRows<T>(query: string, inputs: Array<{ name: string; type: any; value: unknown }> = []) {
  try {
    return await queryRows<T>(query, inputs);
  } catch (error) {
    console.error("Reports query segment failed", error);
    return [] as T[];
  }
}

export async function GET(request: NextRequest) {
  try {
    const reportDate = resolvedDate(request.nextUrl.searchParams.get("date"));
    const dateInput = [{ name: "ReportDate", type: sql.Date, value: reportDate }];

    const [arrivals, departures, inHouse, roomStatus, outletSales, guestBalances, housekeeping] =
      await Promise.all([
        safeQueryRows(
          `
          SELECT
              r.reservation_no AS reservationNo,
              r.guest_name AS guestName,
              r.mobile_no AS mobileNo,
              r.room_type AS roomType,
              rm.room_no AS reservedRoomNo,
              bb.board_basis_name AS boardBasisName,
              r.reservation_status AS reservationStatus
          FROM hotel.reservation r
          LEFT JOIN hotel.room rm
              ON rm.room_id = r.reserved_room_id
          LEFT JOIN hotel.board_basis bb
              ON bb.board_basis_id = r.board_basis_id
          WHERE r.arrival_date = @ReportDate
            AND r.reservation_status NOT IN ('Cancelled', 'No Show')
          ORDER BY r.reservation_status, r.reservation_no
          `,
          dateInput
        ),
        safeQueryRows(
          `
          SELECT
              s.stay_no AS stayNo,
              s.guest_name AS guestName,
              rm.room_no AS roomNo,
              bb.board_basis_name AS boardBasisName,
              s.expected_check_out_date AS expectedCheckOutDate,
              ISNULL(fb.balanceAmount, 0) AS balanceAmount
          FROM hotel.stay s
          INNER JOIN hotel.room rm
              ON rm.room_id = s.room_id
          LEFT JOIN hotel.board_basis bb
              ON bb.board_basis_id = s.board_basis_id
          OUTER APPLY (
              SELECT SUM(ISNULL(f.debit_amount, 0) - ISNULL(f.credit_amount, 0)) AS balanceAmount
              FROM hotel.folio_entry f
              WHERE f.stay_id = s.stay_id
          ) fb
          WHERE s.expected_check_out_date = @ReportDate
            AND s.stay_status = 'Checked In'
          ORDER BY rm.room_no
          `,
          dateInput
        ),
        safeQueryRows(
          `
          SELECT
              s.stay_no AS stayNo,
              s.guest_name AS guestName,
              rm.room_no AS roomNo,
              rm.room_type AS roomType,
              s.check_in_date AS checkInDate,
              s.expected_check_out_date AS expectedCheckOutDate,
              ISNULL(fb.balanceAmount, 0) AS balanceAmount
          FROM hotel.stay s
          INNER JOIN hotel.room rm
              ON rm.room_id = s.room_id
          OUTER APPLY (
              SELECT SUM(ISNULL(f.debit_amount, 0) - ISNULL(f.credit_amount, 0)) AS balanceAmount
              FROM hotel.folio_entry f
              WHERE f.stay_id = s.stay_id
          ) fb
          WHERE s.stay_status = 'Checked In'
          ORDER BY rm.room_no
          `
        ),
        safeQueryRows(
          `
          SELECT
              r.room_no AS roomNo,
              COALESCE(rt.room_type_name, r.room_type) AS roomTypeName,
              r.floor_name AS floorName,
              r.current_status AS currentStatus,
              r.default_rate AS defaultRate
          FROM hotel.room r
          LEFT JOIN hotel.room_type rt
              ON rt.room_type_id = r.room_type_id
          ORDER BY r.floor_name, r.room_no
          `
        ),
        safeQueryRows(
          `
          SELECT
              COALESCE(outletMap.outletName, CONCAT('Location ', CAST(j.outlet_location_id AS NVARCHAR(20))), 'Unmapped Outlet') AS outletName,
              COUNT(1) AS billCount,
              CAST(SUM(ISNULL(b.gross_amount, 0)) AS DECIMAL(18,2)) AS grossAmount,
              CAST(SUM(ISNULL(b.paid_amount, 0)) AS DECIMAL(18,2)) AS paidAmount,
              CAST(SUM(ISNULL(b.balance_amount, 0)) AS DECIMAL(18,2)) AS balanceAmount
          FROM hotel.restaurant_bill b
          LEFT JOIN hotel.restaurant_job j
              ON j.restaurant_job_id = b.restaurant_job_id
          OUTER APPLY (
              SELECT TOP (1) o.outlet_name AS outletName
              FROM hotel.outlet o
              WHERE o.outlet_id = TRY_CAST(j.outlet_location_id AS BIGINT)
                 OR o.location_id = TRY_CAST(j.outlet_location_id AS BIGINT)
              ORDER BY
                  CASE WHEN o.outlet_id = TRY_CAST(j.outlet_location_id AS BIGINT) THEN 0 ELSE 1 END,
                  o.sort_order,
                  o.outlet_id
          ) outletMap
          WHERE CAST(b.created_at AS date) = @ReportDate
          GROUP BY COALESCE(outletMap.outletName, CONCAT('Location ', CAST(j.outlet_location_id AS NVARCHAR(20))), 'Unmapped Outlet')
          ORDER BY grossAmount DESC, outletName
          `,
          dateInput
        ),
        safeQueryRows(
          `
          SELECT TOP (20)
              s.stay_no AS stayNo,
              s.guest_name AS guestName,
              rm.room_no AS roomNo,
              CAST(ISNULL(SUM(ISNULL(f.debit_amount, 0) - ISNULL(f.credit_amount, 0)), 0) AS DECIMAL(18,2)) AS balanceAmount
          FROM hotel.stay s
          INNER JOIN hotel.room rm
              ON rm.room_id = s.room_id
          LEFT JOIN hotel.folio_entry f
              ON f.stay_id = s.stay_id
          WHERE s.stay_status = 'Checked In'
          GROUP BY s.stay_no, s.guest_name, rm.room_no
          HAVING ISNULL(SUM(ISNULL(f.debit_amount, 0) - ISNULL(f.credit_amount, 0)), 0) > 0
          ORDER BY balanceAmount DESC, rm.room_no
          `
        ),
        safeQueryRows(
          `
          SELECT
              hk.housekeeping_task_id AS taskId,
              rm.room_no AS roomNo,
              rm.floor_name AS floorName,
              hk.task_status AS taskStatus,
              st.guest_name AS guestName,
              hk.created_at AS createdAt
          FROM hotel.housekeeping_task hk
          INNER JOIN hotel.room rm
              ON rm.room_id = hk.room_id
          LEFT JOIN hotel.stay st
              ON st.stay_id = hk.stay_id
          WHERE hk.task_status IN ('Dirty', 'Cleaning In Progress')
             OR CAST(hk.created_at AS date) = @ReportDate
          ORDER BY
              CASE hk.task_status
                  WHEN 'Dirty' THEN 1
                  WHEN 'Cleaning In Progress' THEN 2
                  ELSE 3
              END,
              hk.created_at DESC
          `,
          dateInput
        ),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        reportDate,
        arrivals,
        departures,
        inHouse,
        roomStatus,
        outletSales,
        guestBalances,
        housekeeping,
      },
    });
  } catch (error) {
    console.error("GET /api/reports/operations failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to load operations reports." },
      { status: 500 }
    );
  }
}
