import { NextResponse } from "next/server";

import { getManagementSummary } from "@/lib/management-summary";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: getManagementSummary(),
  });
}
