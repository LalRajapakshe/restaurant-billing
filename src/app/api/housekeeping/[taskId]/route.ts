import { NextRequest, NextResponse } from "next/server";

import { mockHousekeepingTasks } from "@/data/mock-housekeeping-tasks";
import { HousekeepingTaskPayload, HousekeepingTaskStatus } from "@/types/housekeeping";

type HousekeepingRouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: HousekeepingRouteContext
) {
  const { taskId } = await params;
  const task = mockHousekeepingTasks.find((item) => item.id === taskId);

  if (!task) {
    return NextResponse.json({ error: "Housekeeping task not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: task,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: HousekeepingRouteContext
) {
  const { taskId } = await params;
  const current = mockHousekeepingTasks.find((item) => item.id === taskId);
  const body = (await request.json().catch(() => ({}))) as HousekeepingTaskPayload;

  if (!current) {
    return NextResponse.json({ error: "Housekeeping task not found" }, { status: 404 });
  }

  const status = (body.status ?? current.status) as HousekeepingTaskStatus;

  const updated = {
    ...current,
    ...body,
    id: taskId,
    status,
    completedAt:
      status === "Ready"
        ? body.completedAt ?? current.completedAt ?? new Date().toISOString()
        : "",
  };

  return NextResponse.json({
    success: true,
    message: "Mock housekeeping task update accepted.",
    data: updated,
  });
}
