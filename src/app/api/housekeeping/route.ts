import { NextRequest, NextResponse } from "next/server";

import { mockHousekeepingTasks } from "@/data/mock-housekeeping-tasks";
import { HousekeepingTaskPayload, HousekeepingTaskStatus } from "@/types/housekeeping";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockHousekeepingTasks,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as HousekeepingTaskPayload;
  const nextId = body.id ?? `HK-${5000 + mockHousekeepingTasks.length + 1}`;
  const status = (body.status ?? "Dirty") as HousekeepingTaskStatus;

  const saved = {
    id: nextId,
    roomId: body.roomId ?? "",
    roomNo: body.roomNo ?? "",
    roomType: body.roomType ?? "",
    floor: body.floor ?? "",
    status,
    assignedTo: body.assignedTo ?? "",
    cleanedBy: body.cleanedBy ?? "",
    note: body.note ?? "",
    createdAt: body.createdAt ?? new Date().toISOString(),
    completedAt: status === "Ready" ? body.completedAt ?? new Date().toISOString() : "",
  };

  return NextResponse.json({
    success: true,
    message: "Mock housekeeping task accepted.",
    data: saved,
  });
}
