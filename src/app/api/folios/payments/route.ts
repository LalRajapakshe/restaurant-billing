import { NextRequest, NextResponse } from "next/server";

import { executeProcedure, sql } from "@/lib/db-exec";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      stayId: number;
      roomId: number;
      amount: number;
      paymentMethod: "Cash" | "Card" | "Transfer";
      referenceNo?: string | null;
      note?: string | null;
      createdByUserId?: number | null;
    };

    const result = await executeProcedure("hotel.sp_folio_add_payment", [
      { name: "StayId", type: sql.BigInt, value: body.stayId },
      { name: "RoomId", type: sql.BigInt, value: body.roomId },
      { name: "Amount", type: sql.Decimal(18, 2), value: body.amount },
      {
        name: "PaymentMethod",
        type: sql.NVarChar(20),
        value: body.paymentMethod,
      },
      {
        name: "ReferenceNo",
        type: sql.NVarChar(50),
        value: body.referenceNo ?? null,
      },
      { name: "Note", type: sql.NVarChar(1000), value: body.note ?? null },
      {
        name: "CreatedByUserId",
        type: sql.Numeric(18, 0),
        value: body.createdByUserId ?? null,
      },
    ]);

    return NextResponse.json({
      success: true,
      data: result.recordset?.[0] ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add folio payment.";

    console.error("POST /api/folios/payments failed", error);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
