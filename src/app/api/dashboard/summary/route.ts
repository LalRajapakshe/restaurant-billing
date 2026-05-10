import { NextRequest, NextResponse } from "next/server";
import { queryRows, sql } from "@/lib/db-exec";

function resolvedDate(raw?: string | null) {
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : new Date().toISOString().slice(0, 10);
}

async function safeQueryRows<T>(query: string, inputs: Array<{ name: string; type: any; value: unknown }> = []) {
  try {
    return await queryRows<T>(query, inputs);
  } catch (error) {
    console.error("Dashboard query segment failed", error);
    return [] as T[];
  }
}

export async function GET(request: NextRequest) {
  try {
    const reportDate = resolvedDate(request.nextUrl.searchParams.get("date"));
    const dateInput = [{ name: "ReportDate", type: sql.Date, value: reportDate }];

    const [headlineRows, roomStatusRows, arrivalRows, departureRows, outletRows, housekeepingRows] =
      await Promise.all([
        safeQueryRows(
          `
          SELECT
              CAST((SELECT COUNT(1)
                    FROM hotel.reservation
                    WHERE arrival_date = @ReportDate
                      AND reservation_status NOT IN ('Cancelled', 'No Show')) AS INT) AS arrivalsToday,
              CAST((SELECT COUNT(1)
                    FROM hotel.stay
                    WHERE expected_check_out_date = @ReportDate
                      AND stay_status = 'Checked In') AS INT) AS departuresToday,
              CAST((SELECT COUNT(1)
                    FROM hotel.stay
                    WHERE stay_status = 'Checked In') AS INT) AS inHouseGuests,
              CAST(ISNULL((
                  SELECT SUM(CASE WHEN x.balance_amount > 0 THEN x.balance_amount ELSE 0 END)
                  FROM (
                      SELECT
                          s.stay_id,
                          ISNULL(SUM(ISNULL(f.debit_amount, 0) - ISNULL(f.credit_amount, 0)), 0) AS balance_amount
                      FROM hotel.stay s
                      LEFT JOIN hotel.folio_entry f
                          ON f.stay_id = s.stay_id
                      WHERE s.stay_status = 'Checked In'
                      GROUP BY s.stay_id
                  ) x
              ), 0) AS DECIMAL(18,2)) AS folioOutstanding,
              CAST(ISNULL((
                  SELECT SUM(ISNULL(b.gross_amount, 0))
                  FROM hotel.restaurant_bill b
                  WHERE CAST(b.created_at AS date) = @ReportDate
              ), 0) AS DECIMAL(18,2)) AS restaurantSalesToday,
              CAST((SELECT COUNT(1)
                    FROM hotel.housekeeping_task
                    WHERE task_status IN ('Dirty', 'Cleaning In Progress')) AS INT) AS housekeepingOpen
          `,
          dateInput
        ),
        safeQueryRows(
          `
          SELECT
              current_status AS statusName,
              COUNT(1) AS roomCount
          FROM hotel.room
          GROUP BY current_status
          ORDER BY current_status
          `
        ),
        safeQueryRows(
          `
          SELECT TOP (8)
              r.reservation_no AS reservationNo,
              r.guest_name AS guestName,
              rm.room_no AS roomNo,
              r.room_type AS roomType,
              r.mobile_no AS mobileNo,
              r.reservation_status AS reservationStatus
          FROM hotel.reservation r
          LEFT JOIN hotel.room rm
              ON rm.room_id = r.reserved_room_id
          WHERE r.arrival_date = @ReportDate
            AND r.reservation_status NOT IN ('Cancelled', 'No Show')
          ORDER BY r.reservation_status, r.reservation_no
          `,
          dateInput
        ),
        safeQueryRows(
          `
          SELECT TOP (8)
              s.stay_no AS stayNo,
              s.guest_name AS guestName,
              rm.room_no AS roomNo,
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
          WHERE s.expected_check_out_date = @ReportDate
            AND s.stay_status = 'Checked In'
          ORDER BY rm.room_no
          `,
          dateInput
        ),
        safeQueryRows(
          `
          SELECT
              COALESCE(outletMap.outletName, CONCAT('Location ', CAST(j.outlet_location_id AS NVARCHAR(20))), 'Unmapped Outlet') AS outletName,
              COUNT(1) AS billCount,
              CAST(SUM(ISNULL(b.gross_amount, 0)) AS DECIMAL(18,2)) AS grossAmount
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
          SELECT TOP (8)
              hk.housekeeping_task_id AS taskId,
              rm.room_no AS roomNo,
              rm.floor_name AS floorName,
              hk.task_status AS taskStatus,
              st.guest_name AS guestName
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
        headline: headlineRows[0] ?? {
          arrivalsToday: 0,
          departuresToday: 0,
          inHouseGuests: 0,
          folioOutstanding: 0,
          restaurantSalesToday: 0,
          housekeepingOpen: 0,
        },
        roomStatus: roomStatusRows,
        arrivals: arrivalRows,
        departures: departureRows,
        outletSales: outletRows,
        housekeeping: housekeepingRows,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/summary failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard summary." },
      { status: 500 }
    );
  }
}
