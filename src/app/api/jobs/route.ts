import { NextRequest, NextResponse } from "next/server";
import { mockJobs } from "@/data/mock-jobs";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockJobs,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    message: "Mock job accepted.",
    data: body,
  });
}
