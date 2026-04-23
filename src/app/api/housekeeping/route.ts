import { NextRequest, NextResponse } from "next/server";

import { queryRows, sql } from "@/lib/db-exec";

type HousekeepingTaskRow = {
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

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status")?.trim() ?? "";
    const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
    const likeSearch = `%${search}%`;

    const rows = await queryRows<HousekeepingTaskRow>(
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
      WHERE
          (@Status = '' OR t.task_status = @Status)
          AND (
              @Search = ''
              OR r.room_no LIKE @LikeSearch
              OR r.room_type LIKE @LikeSearch
              OR ISNULL(s.guest_name, '') LIKE @LikeSearch
              OR ISNULL(s.stay_no, '') LIKE @LikeSearch
          )
      ORDER BY
          CASE t.task_status
              WHEN 'Dirty' THEN 1
              WHEN 'Cleaning In Progress' THEN 2
              WHEN 'Ready' THEN 3
              ELSE 4
          END,
          t.created_at DESC,
          t.housekeeping_task_id DESC
      `,
      [
        { name: "Status", type: sql.NVarChar(30), value: status },
        { name: "Search", type: sql.NVarChar(200), value: search },
        { name: "LikeSearch", type: sql.NVarChar(210), value: likeSearch },
      ]
    );

    return NextResponse.json({
      success: true,
      data: rows.map((row) => ({
        ...row,
        housekeepingTaskId: Number(row.housekeepingTaskId),
        roomId: Number(row.roomId),
        stayId: row.stayId != null ? Number(row.stayId) : null,
      })),
    });
  } catch (error) {
    console.error("GET /api/housekeeping failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load housekeeping tasks.",
      },
      { status: 500 }
    );
  }
}
