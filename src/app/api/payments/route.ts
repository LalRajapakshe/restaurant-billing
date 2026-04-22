import { NextRequest, NextResponse } from "next/server";
import { mockPayments } from "@/data/mock-payments";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockPayments,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    message: "Mock payment accepted.",
    data: body,
  });
}
