import { NextRequest, NextResponse } from "next/server";

import { executeProcedure, sql } from "@/lib/db-exec";

function generateJobNo() {
  return `JOB-${Date.now()}`;
}

export async function GET() {
  try {
    const result = await executeProcedure("hotel.sp_restaurant_job_list");

    return NextResponse.json({
      success: true,
      data: result.recordset ?? [],
    });
  } catch (error) {
    console.error("GET /api/restaurant/jobs failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load restaurant jobs.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      jobNo?: string;
      outletLocationId: number;
      tableNo: string;
      guestType: "FIT" | "Room Guest";
      stayId?: number | null;
      roomId?: number | null;
      customerName: string;
      mobileNo?: string | null;
      createdByUserId?: number | null;
    };

    const result = await executeProcedure("hotel.sp_restaurant_job_create", [
      {
        name: "JobNo",
        type: sql.NVarChar(30),
        value: body.jobNo || generateJobNo(),
      },
      {
        name: "OutletLocationId",
        type: sql.Numeric(18, 0),
        value: body.outletLocationId,
      },
      { name: "TableNo", type: sql.NVarChar(20), value: body.tableNo },
      { name: "GuestType", type: sql.NVarChar(20), value: body.guestType },
      { name: "StayId", type: sql.BigInt, value: body.stayId ?? null },
      { name: "RoomId", type: sql.BigInt, value: body.roomId ?? null },
      {
        name: "CustomerName",
        type: sql.NVarChar(200),
        value: body.customerName,
      },
      { name: "MobileNo", type: sql.NVarChar(30), value: body.mobileNo ?? null },
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
    console.error("POST /api/restaurant/jobs failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create restaurant job.",
      },
      { status: 500 }
    );
  }
}
