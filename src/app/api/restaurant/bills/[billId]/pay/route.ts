import { NextRequest, NextResponse } from "next/server";

import { getDbPool, sql } from "@/lib/db";

type RestaurantBillPayRouteContext = {
  params: Promise<{ billId: string }>;
};

type CurrentBillRow = {
  restaurantBillId: number;
  restaurantJobId: number;
  guestType: "FIT" | "Room Guest";
  grossAmount: number;
  paidAmount: number;
  balanceAmount: number;
  billStatus: string;
};

function parseBillId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(
  request: NextRequest,
  { params }: RestaurantBillPayRouteContext
) {
  const { billId } = await params;
  const parsedBillId = parseBillId(billId);

  if (!parsedBillId) {
    return NextResponse.json(
      { success: false, error: "Invalid restaurant bill id." },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    amount?: number;
    method?: "Cash" | "Card" | "Transfer";
    fullSettlement?: boolean;
  };

  const pool = await getDbPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const currentRequest = new sql.Request(transaction);
    currentRequest.input("RestaurantBillId", sql.BigInt, parsedBillId);

    const currentResult = await currentRequest.query<CurrentBillRow>(
      `
      SELECT TOP (1)
          b.restaurant_bill_id AS restaurantBillId,
          b.restaurant_job_id AS restaurantJobId,
          j.guest_type AS guestType,
          b.gross_amount AS grossAmount,
          b.paid_amount AS paidAmount,
          b.balance_amount AS balanceAmount,
          b.bill_status AS billStatus
      FROM hotel.restaurant_bill b
      INNER JOIN hotel.restaurant_job j
          ON j.restaurant_job_id = b.restaurant_job_id
      WHERE b.restaurant_bill_id = @RestaurantBillId
      `
    );

    const current = currentResult.recordset[0];

    if (!current) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, error: "Restaurant bill not found." },
        { status: 404 }
      );
    }

    if (current.guestType !== "FIT") {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, error: "Only FIT bills can be paid directly here." },
        { status: 400 }
      );
    }

    const requestedAmount = body.fullSettlement
      ? Number(current.balanceAmount ?? 0)
      : Number(body.amount ?? 0);

    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, error: "Payment amount must be greater than zero." },
        { status: 400 }
      );
    }

    if (requestedAmount > Number(current.balanceAmount ?? 0)) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, error: "Payment amount cannot exceed bill balance." },
        { status: 400 }
      );
    }

    const nextPaid = Number(current.paidAmount ?? 0) + requestedAmount;
    const nextBalance = Number(current.balanceAmount ?? 0) - requestedAmount;
    const nextBillStatus =
      nextBalance <= 0 ? "Paid" : nextPaid > 0 ? "Partially Paid" : "Open";

    const updateBillRequest = new sql.Request(transaction);
    updateBillRequest.input("RestaurantBillId", sql.BigInt, parsedBillId);
    updateBillRequest.input("NextPaid", sql.Decimal(18, 2), nextPaid);
    updateBillRequest.input("NextBalance", sql.Decimal(18, 2), nextBalance);
    updateBillRequest.input("NextBillStatus", sql.NVarChar(20), nextBillStatus);

    await updateBillRequest.query(
      `
      UPDATE hotel.restaurant_bill
      SET paid_amount = @NextPaid,
          balance_amount = @NextBalance,
          bill_status = @NextBillStatus,
          updated_at = SYSDATETIME()
      WHERE restaurant_bill_id = @RestaurantBillId
      `
    );

    const totalsRequest = new sql.Request(transaction);
    totalsRequest.input("RestaurantJobId", sql.BigInt, current.restaurantJobId);

    const totalsResult = await totalsRequest.query<{ remainingBalance: number; totalPaid: number }>(
      `
      SELECT
          ISNULL(SUM(balance_amount), 0) AS remainingBalance,
          ISNULL(SUM(paid_amount), 0) AS totalPaid
      FROM hotel.restaurant_bill
      WHERE restaurant_job_id = @RestaurantJobId
        AND bill_status <> 'Cancelled'
      `
    );

    const totals = totalsResult.recordset[0];
    const jobStatus =
      Number(totals?.remainingBalance ?? 0) <= 0
        ? "Closed"
        : Number(totals?.totalPaid ?? 0) > 0
          ? "Partially Paid"
          : "Open";

    const updateJobRequest = new sql.Request(transaction);
    updateJobRequest.input("RestaurantJobId", sql.BigInt, current.restaurantJobId);
    updateJobRequest.input("JobStatus", sql.NVarChar(20), jobStatus);

    await updateJobRequest.query(
      `
      UPDATE hotel.restaurant_job
      SET job_status = @JobStatus,
          closed_at = CASE WHEN @JobStatus = 'Closed' THEN COALESCE(closed_at, SYSDATETIME()) ELSE NULL END,
          updated_at = SYSDATETIME()
      WHERE restaurant_job_id = @RestaurantJobId
      `
    );

    await transaction.commit();

    return NextResponse.json({
      success: true,
      data: {
        restaurantBillId: current.restaurantBillId,
        restaurantJobId: current.restaurantJobId,
        paidAmount: nextPaid,
        balanceAmount: nextBalance,
        billStatus: nextBillStatus,
        jobStatus,
        paymentMethod: body.method ?? "Cash",
        appliedAmount: requestedAmount,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("POST /api/restaurant/bills/[billId]/pay failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to apply restaurant bill payment.",
      },
      { status: 500 }
    );
  }
}
