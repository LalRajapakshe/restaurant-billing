import { NextRequest, NextResponse } from "next/server";

import { executeProcedure, sql } from "@/lib/db-exec";

type StayCheckoutRouteContext = {
  params: Promise<{ stayId: string }>;
};

function parseStayId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(
  request: NextRequest,
  { params }: StayCheckoutRouteContext
) {
  try {
    const { stayId } = await params;
    const parsedStayId = parseStayId(stayId);

    if (!parsedStayId) {
      return NextResponse.json(
        { success: false, error: "Invalid stay id." },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      completedByUserId?: number | null;
      note?: string | null;
    };

    const result = await executeProcedure("hotel.sp_stay_checkout", [
      { name: "StayId", type: sql.BigInt, value: parsedStayId },
      {
        name: "CompletedByUserId",
        type: sql.Numeric(18, 0),
        value: body.completedByUserId ?? null,
      },
      { name: "Note", type: sql.NVarChar(1000), value: body.note ?? null },
    ]);

    return NextResponse.json({
      success: true,
      data: result.recordset?.[0] ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to complete checkout.";

    const isValidationError = message.includes("Folio balance must be zero");

    console.error("POST /api/stays/[stayId]/checkout failed", error);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
