import { NextRequest, NextResponse } from "next/server";
import { mockBillsByJob } from "@/data/mock-bills";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockBillsByJob,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    message: "Mock bill accepted.",
    data: body,
  });
}
