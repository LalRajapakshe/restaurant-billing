import { NextRequest, NextResponse } from "next/server";

import { getDbPool, sql } from "@/lib/db";

type HousekeepingTaskRouteContext = {
  params: Promise<{ taskId: string }>;
};

type TaskDetailRow = {
  housekeepingTaskId: number;
  roomId: number;
  roomNo: string;
  roomType: string;
  floorName: string;
  stayId?: number | null;
  stayNo?: string | null;
  guestName?: string | null;
  taskStatus: "Dirty" | "Cleaning In Progress" | "Ready";
  roomStatus: string;
  note?: string | null;
  createdAt: string;
  completedAt?: string | null;
};

function parseTaskId(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function readTask(pool: sql.ConnectionPool, taskId: number) {
  const result = await pool.request()
    .input("TaskId", sql.BigInt, taskId)
    .query<TaskDetailRow>(
      `
      SELECT
          t.housekeeping_task_id AS housekeepingTaskId,
          t.room_id AS roomId,
          r.room_no AS roomNo,
          r.room_type AS roomType,
          r.floor_name AS floorName,
          t.stay_id AS stayId,
          s.stay_no AS stayNo,
          s.guest_name AS guestName,
          t.task_status AS taskStatus,
          r.current_status AS roomStatus,
          t.note,
          CONVERT(VARCHAR(19), t.created_at, 120) AS createdAt,
          CONVERT(VARCHAR(19), t.completed_at, 120) AS completedAt
      FROM hotel.housekeeping_task t
      INNER JOIN hotel.room r
          ON r.room_id = t.room_id
      LEFT JOIN hotel.stay s
          ON s.stay_id = t.stay_id
      WHERE t.housekeeping_task_id = @TaskId
      `
    );

  return result.recordset[0] ?? null;
}

function mappedRoomStatus(taskStatus: "Dirty" | "Cleaning In Progress" | "Ready") {
  switch (taskStatus) {
    case "Dirty":
      return "Dirty";
    case "Cleaning In Progress":
      return "Cleaning In Progress";
    case "Ready":
      return "Vacant Ready";
    default:
      return "Dirty";
  }
}

export async function GET(
  request: NextRequest,
  { params }: HousekeepingTaskRouteContext
) {
  try {
    const { taskId } = await params;
    const parsedTaskId = parseTaskId(taskId);

    if (!parsedTaskId) {
      return NextResponse.json(
        { success: false, error: "Invalid housekeeping task id." },
        { status: 400 }
      );
    }

    const pool = await getDbPool();
    const task = await readTask(pool, parsedTaskId);

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Housekeeping task not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("GET /api/housekeeping/[taskId] failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load housekeeping task.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: HousekeepingTaskRouteContext
) {
  const { taskId } = await params;
  const parsedTaskId = parseTaskId(taskId);

  if (!parsedTaskId) {
    return NextResponse.json(
      { success: false, error: "Invalid housekeeping task id." },
      { status: 400 }
    );
  }

  const body = (await request.json()) as {
    taskStatus: "Dirty" | "Cleaning In Progress" | "Ready";
    note?: string | null;
    assignedToUserId?: number | null;
    cleanedByUserId?: number | null;
  };

  const pool = await getDbPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const currentRequest = new sql.Request(transaction);
    currentRequest.input("TaskId", sql.BigInt, parsedTaskId);

    const currentResult = await currentRequest.query<{
      roomId: number;
      currentTaskStatus: "Dirty" | "Cleaning In Progress" | "Ready";
      currentRoomStatus: string;
    }>(
      `
      SELECT TOP (1)
          t.room_id AS roomId,
          t.task_status AS currentTaskStatus,
          r.current_status AS currentRoomStatus
      FROM hotel.housekeeping_task t
      INNER JOIN hotel.room r
          ON r.room_id = t.room_id
      WHERE t.housekeeping_task_id = @TaskId
      `
    );

    const current = currentResult.recordset[0];

    if (!current) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, error: "Housekeeping task not found." },
        { status: 404 }
      );
    }

    const nextRoomStatus = mappedRoomStatus(body.taskStatus);

    const updateTaskRequest = new sql.Request(transaction);
    updateTaskRequest.input("TaskId", sql.BigInt, parsedTaskId);
    updateTaskRequest.input("TaskStatus", sql.NVarChar(30), body.taskStatus);
    updateTaskRequest.input("AssignedToUserId", sql.Numeric(18, 0), body.assignedToUserId ?? null);
    updateTaskRequest.input("CleanedByUserId", sql.Numeric(18, 0), body.cleanedByUserId ?? null);
    updateTaskRequest.input("Note", sql.NVarChar(1000), body.note ?? null);

    await updateTaskRequest.query(
      `
      UPDATE hotel.housekeeping_task
      SET task_status = @TaskStatus,
          assigned_to_user_id = COALESCE(@AssignedToUserId, assigned_to_user_id),
          cleaned_by_user_id = CASE
              WHEN @TaskStatus = 'Ready' THEN COALESCE(@CleanedByUserId, cleaned_by_user_id)
              ELSE cleaned_by_user_id
          END,
          note = @Note,
          completed_at = CASE WHEN @TaskStatus = 'Ready' THEN SYSDATETIME() ELSE NULL END
      WHERE housekeeping_task_id = @TaskId
      `
    );

    const updateRoomRequest = new sql.Request(transaction);
    updateRoomRequest.input("RoomId", sql.BigInt, Number(current.roomId));
    updateRoomRequest.input("RoomStatus", sql.NVarChar(30), nextRoomStatus);
    updateRoomRequest.input("CleanedByUserId", sql.Numeric(18, 0), body.cleanedByUserId ?? null);
    updateRoomRequest.input("HousekeepingNote", sql.NVarChar(500), body.note ?? null);

    await updateRoomRequest.query(
      `
      UPDATE hotel.room
      SET current_status = @RoomStatus,
          housekeeping_note = @HousekeepingNote,
          last_cleaned_by_user_id = CASE
              WHEN @RoomStatus = 'Vacant Ready' THEN COALESCE(@CleanedByUserId, last_cleaned_by_user_id)
              ELSE last_cleaned_by_user_id
          END,
          updated_at = SYSDATETIME()
      WHERE room_id = @RoomId
      `
    );

    if (current.currentRoomStatus !== nextRoomStatus) {
      const historyRequest = new sql.Request(transaction);
      historyRequest.input("RoomId", sql.BigInt, Number(current.roomId));
      historyRequest.input("FromStatus", sql.NVarChar(30), current.currentRoomStatus);
      historyRequest.input("ToStatus", sql.NVarChar(30), nextRoomStatus);
      historyRequest.input("Note", sql.NVarChar(500), body.note ?? null);

      await historyRequest.query(
        `
        INSERT INTO hotel.room_status_history (
            room_id,
            from_status,
            to_status,
            changed_at,
            changed_by_user_id,
            note
        )
        VALUES (
            @RoomId,
            @FromStatus,
            @ToStatus,
            SYSDATETIME(),
            NULL,
            @Note
        )
        `
      );
    }

    await transaction.commit();

    const task = await readTask(pool, parsedTaskId);

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("PUT /api/housekeeping/[taskId] failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update housekeeping task.",
      },
      { status: 500 }
    );
  }
}
