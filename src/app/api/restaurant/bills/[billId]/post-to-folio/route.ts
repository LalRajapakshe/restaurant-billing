import { NextRequest, NextResponse } from "next/server";

import { executeProcedure, sql } from "@/lib/db-exec";

type RestaurantBillPostToFolioRouteContext = {
  params: Promise<{ billId: string }>;
};

function parseBillId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(
  request: NextRequest,
  { params }: RestaurantBillPostToFolioRouteContext
) {
  try {
    const { billId } = await params;
    const parsedBillId = parseBillId(billId);

    if (!parsedBillId) {
      return NextResponse.json(
        { success: false, error: "Invalid restaurant bill id." },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      postedByUserId?: number | null;
      note?: string | null;
    };

    const result = await executeProcedure(
      "hotel.sp_restaurant_bill_post_to_folio",
      [
        { name: "RestaurantBillId", type: sql.BigInt, value: parsedBillId },
        {
          name: "PostedByUserId",
          type: sql.Numeric(18, 0),
          value: body.postedByUserId ?? null,
        },
        { name: "Note", type: sql.NVarChar(1000), value: body.note ?? null },
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.recordset?.[0] ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to post bill to folio.";

    console.error("POST /api/restaurant/bills/[billId]/post-to-folio failed", error);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
