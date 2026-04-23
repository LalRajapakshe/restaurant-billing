import { NextRequest, NextResponse } from "next/server";

import { executeProcedure, sql } from "@/lib/db-exec";

type StayRouteContext = {
  params: Promise<{ stayId: string }>;
};

function parseStayId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(
  request: NextRequest,
  { params }: StayRouteContext
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

    const result = await executeProcedure("hotel.sp_stay_get", [
      { name: "StayId", type: sql.BigInt, value: parsedStayId },
    ]);

    const stay = result.recordset?.[0] ?? null;

    if (!stay) {
      return NextResponse.json(
        { success: false, error: "Stay not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stay,
    });
  } catch (error) {
    console.error("GET /api/stays/[stayId] failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load stay.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: StayRouteContext
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

    const body = (await request.json()) as {
      guestName: string;
      mobileNo?: string | null;
      expectedCheckOutDate: string;
      adults: number;
      children: number;
      boardBasisId: number;
      roomRate: number;
      note?: string | null;
      updatedByUserId?: number | null;
    };

    const result = await executeProcedure("hotel.sp_stay_update", [
      { name: "StayId", type: sql.BigInt, value: parsedStayId },
      { name: "GuestName", type: sql.NVarChar(200), value: body.guestName },
      { name: "MobileNo", type: sql.NVarChar(30), value: body.mobileNo ?? null },
      {
        name: "ExpectedCheckOutDate",
        type: sql.Date,
        value: body.expectedCheckOutDate,
      },
      { name: "Adults", type: sql.Int, value: body.adults },
      { name: "Children", type: sql.Int, value: body.children },
      { name: "BoardBasisId", type: sql.Int, value: body.boardBasisId },
      { name: "RoomRate", type: sql.Decimal(18, 2), value: body.roomRate },
      { name: "Note", type: sql.NVarChar(1000), value: body.note ?? null },
      {
        name: "UpdatedByUserId",
        type: sql.Numeric(18, 0),
        value: body.updatedByUserId ?? null,
      },
    ]);

    return NextResponse.json({
      success: true,
      data: result.recordset?.[0] ?? null,
    });
  } catch (error) {
    console.error("PUT /api/stays/[stayId] failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update stay.",
      },
      { status: 500 }
    );
  }
}
