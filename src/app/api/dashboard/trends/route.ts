import { NextRequest, NextResponse } from "next/server";
import { queryRows, sql } from "@/lib/db-exec";

function resolvedDate(raw?: string | null) {
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : new Date().toISOString().slice(0, 10);
}

function resolvedDays(raw?: string | null) {
  const parsed = Number(raw ?? 7);
  if (!Number.isFinite(parsed)) return 7;
  return Math.max(7, Math.min(30, Math.trunc(parsed)));
}

export async function GET(request: NextRequest) {
  try {
    const endDate = resolvedDate(request.nextUrl.searchParams.get("date"));
    const days = resolvedDays(request.nextUrl.searchParams.get("days"));

    const rows = await queryRows(
      `
      WITH DateSeries AS (
          SELECT CAST(DATEADD(DAY, -(seq.n - 1), @EndDate) AS date) AS reportDate
          FROM (
              SELECT TOP (@Days) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
              FROM sys.all_objects
          ) seq
      )
      SELECT
          CONVERT(VARCHAR(10), d.reportDate, 23) AS reportDate,
          CAST((
              SELECT COUNT(1)
              FROM hotel.reservation r
              WHERE r.arrival_date = d.reportDate
                AND r.reservation_status NOT IN ('Cancelled', 'No Show')
          ) AS INT) AS arrivals,
          CAST((
              SELECT COUNT(1)
              FROM hotel.stay s
              WHERE s.expected_check_out_date = d.reportDate
                AND s.stay_status = 'Checked In'
          ) AS INT) AS departures,
          CAST(ISNULL((
              SELECT SUM(ISNULL(b.gross_amount, 0))
              FROM hotel.restaurant_bill b
              WHERE CAST(b.created_at AS date) = d.reportDate
          ), 0) AS DECIMAL(18,2)) AS restaurantSales,
          CAST((
              SELECT COUNT(1)
              FROM hotel.restaurant_bill b
              WHERE CAST(b.created_at AS date) = d.reportDate
          ) AS INT) AS billCount
      FROM DateSeries d
      ORDER BY d.reportDate ASC
      `,
      [
        { name: "EndDate", type: sql.Date, value: endDate },
        { name: "Days", type: sql.Int, value: days },
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        endDate,
        days,
        trend: rows,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/trends failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard trends." },
      { status: 500 }
    );
  }
}
