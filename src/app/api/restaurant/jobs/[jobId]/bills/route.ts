import { NextRequest, NextResponse } from "next/server";

import {
  executeProcedure,
  executeProcedureInTransaction,
  sql,
  withTransaction,
} from "@/lib/db-exec";

type RestaurantJobBillsRouteContext = {
  params: Promise<{ jobId: string }>;
};

type BillItemPayload = {
  itemId?: number | null;
  itemGroupId?: number | null;
  itemCategoryId?: number | null;
  itemName: string;
  qty: number;
  unitPrice: number;
  lineAmount?: number;
  note?: string | null;
};

type RestaurantBillRow = {
  restaurantBillId: number;
  billNo: string;
  billType: "KOT" | "BOT" | "Main Meal";
  mealType?: "Breakfast" | "Lunch" | "Dinner" | "A la carte" | null;
  grossAmount: number;
  paidAmount: number;
  balanceAmount: number;
  billStatus: string;
  postedToFolio: boolean;
  postedFolioEntryId?: number | null;
  postedAt?: string | null;
  createdAt: string;
};

type RestaurantBillItemRow = {
  restaurantBillItemId: number;
  restaurantBillId: number;
  itemId?: number | null;
  itemGroupId?: number | null;
  itemCategoryId?: number | null;
  itemName: string;
  qty: number;
  unitPrice: number;
  lineAmount: number;
  note?: string | null;
};

function parseJobId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function generateBillNo() {
  return `BILL-${Date.now()}`;
}

export async function GET(
  request: NextRequest,
  { params }: RestaurantJobBillsRouteContext
) {
  try {
    const { jobId } = await params;
    const parsedJobId = parseJobId(jobId);

    if (!parsedJobId) {
      return NextResponse.json(
        { success: false, error: "Invalid restaurant job id." },
        { status: 400 }
      );
    }

    const result = await executeProcedure("hotel.sp_restaurant_bill_list_by_job", [
      { name: "RestaurantJobId", type: sql.BigInt, value: parsedJobId },
    ]);

    const bills = ((result.recordsets?.[0] ?? []) as unknown) as RestaurantBillRow[];
    const items = ((result.recordsets?.[1] ?? []) as unknown) as RestaurantBillItemRow[];

    const data = bills.map((bill) => ({
      ...bill,
      items: items.filter((item) => item.restaurantBillId === bill.restaurantBillId),
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/restaurant/jobs/[jobId]/bills failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load restaurant bills.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RestaurantJobBillsRouteContext
) {
  try {
    const { jobId } = await params;
    const parsedJobId = parseJobId(jobId);

    if (!parsedJobId) {
      return NextResponse.json(
        { success: false, error: "Invalid restaurant job id." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as {
      billNo?: string;
      billType: "KOT" | "BOT" | "Main Meal";
      mealType?: "Breakfast" | "Lunch" | "Dinner" | "A la carte" | null;
      createdByUserId?: number | null;
      items: BillItemPayload[];
    };

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one bill item is required." },
        { status: 400 }
      );
    }

    const transactionResult = await withTransaction(async (transaction) => {
      const createResult = await executeProcedureInTransaction<{ restaurantBillId: number }>(
        transaction,
        "hotel.sp_restaurant_bill_create",
        [
          {
            name: "RestaurantJobId",
            type: sql.BigInt,
            value: parsedJobId,
          },
          {
            name: "BillNo",
            type: sql.NVarChar(30),
            value: body.billNo || generateBillNo(),
          },
          {
            name: "BillType",
            type: sql.NVarChar(20),
            value: body.billType,
          },
          {
            name: "MealType",
            type: sql.NVarChar(20),
            value: body.mealType ?? null,
          },
          {
            name: "CreatedByUserId",
            type: sql.Numeric(18, 0),
            value: body.createdByUserId ?? null,
          },
        ]
      );

      const restaurantBillId =
        createResult.recordset?.[0]?.restaurantBillId ??
        createResult.recordsets?.[0]?.[0]?.restaurantBillId;

      if (!restaurantBillId) {
        throw new Error("Failed to create restaurant bill header.");
      }

      let grossAmount = 0;

      for (const item of body.items) {
        const qty = Number(item.qty ?? 0);
        const unitPrice = Number(item.unitPrice ?? 0);
        const lineAmount = Number.isFinite(Number(item.lineAmount))
          ? Number(item.lineAmount)
          : qty * unitPrice;

        grossAmount += lineAmount;

        await executeProcedureInTransaction(
          transaction,
          "hotel.sp_restaurant_bill_add_item",
          [
            {
              name: "RestaurantBillId",
              type: sql.BigInt,
              value: restaurantBillId,
            },
            {
              name: "ItemId",
              type: sql.Numeric(18, 0),
              value: item.itemId ?? null,
            },
            {
              name: "ItemGroupId",
              type: sql.Numeric(18, 0),
              value: item.itemGroupId ?? null,
            },
            {
              name: "ItemCategoryId",
              type: sql.Numeric(18, 0),
              value: item.itemCategoryId ?? null,
            },
            {
              name: "ItemName",
              type: sql.NVarChar(250),
              value: item.itemName,
            },
            {
              name: "Qty",
              type: sql.Decimal(18, 3),
              value: qty,
            },
            {
              name: "UnitPrice",
              type: sql.Decimal(18, 2),
              value: unitPrice,
            },
            {
              name: "LineAmount",
              type: sql.Decimal(18, 2),
              value: lineAmount,
            },
            {
              name: "Note",
              type: sql.NVarChar(500),
              value: item.note ?? null,
            },
          ]
        );
      }

      return {
        restaurantBillId,
        grossAmount,
      };
    });

    return NextResponse.json({
      success: true,
      data: transactionResult,
    });
  } catch (error) {
    console.error("POST /api/restaurant/jobs/[jobId]/bills failed", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create restaurant bill.",
      },
      { status: 500 }
    );
  }
}
