import { NextResponse } from "next/server";
import { mockDashboard } from "@/data/mock-dashboard";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockDashboard,
  });
}
