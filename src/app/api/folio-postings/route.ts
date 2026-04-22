import { NextRequest, NextResponse } from "next/server";

import { mockFolioPostings } from "@/data/mock-folio-postings";
import { FolioPostingRecord } from "@/types/restaurant";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockFolioPostings,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Partial<FolioPostingRecord>;

  const saved: FolioPostingRecord = {
    postingId: `FOL-${7000 + mockFolioPostings.length + 1}`,
    roomNo: body.roomNo ?? "",
    guestName: body.guestName ?? "",
    outlet: body.outlet ?? "",
    sourceJobId: body.sourceJobId ?? "",
    amount: Number(body.amount ?? 0),
    postedAt: new Date().toISOString(),
    billingType: body.billingType ?? "KOT",
    mealType: body.mealType ?? null,
  };

  return NextResponse.json({
    success: true,
    message: "Mock folio posting accepted.",
    data: saved,
  });
}
