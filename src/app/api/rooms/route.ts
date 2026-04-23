import { NextResponse } from "next/server";

import { executeProcedure } from "@/lib/db-exec";

export async function GET() {
  try {
    const result = await executeProcedure("hotel.sp_room_list");

    return NextResponse.json({
      success: true,
      data: result.recordset ?? [],
    });
  } catch (error) {
    console.error("GET /api/rooms failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load rooms.",
      },
      { status: 500 }
    );
  }
}
