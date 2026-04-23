import { NextRequest, NextResponse } from "next/server";

import { executeProcedure, sql } from "@/lib/db-exec";

type RestaurantJobRouteContext = {
  params: Promise<{ jobId: string }>;
};

function parseJobId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(
  request: NextRequest,
  { params }: RestaurantJobRouteContext
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

    const result = await executeProcedure("hotel.sp_restaurant_job_get", [
      { name: "RestaurantJobId", type: sql.BigInt, value: parsedJobId },
    ]);

    const job = result.recordset?.[0] ?? null;

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Restaurant job not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("GET /api/restaurant/jobs/[jobId] failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load restaurant job.",
      },
      { status: 500 }
    );
  }
}
