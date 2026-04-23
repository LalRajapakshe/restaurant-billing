import { NextResponse } from "next/server";

import { queryRows } from "@/lib/db-exec";

type BoardBasisRow = {
  boardBasisId: number;
  boardBasisCode: string;
  boardBasisName: string;
  sortOrder: number;
  isActive: boolean;
};

export async function GET() {
  try {
    const rows = await queryRows<BoardBasisRow>(
      `
      SELECT
          board_basis_id AS boardBasisId,
          board_basis_code AS boardBasisCode,
          board_basis_name AS boardBasisName,
          sort_order AS sortOrder,
          is_active AS isActive
      FROM hotel.board_basis
      WHERE is_active = 1
      ORDER BY sort_order, board_basis_name
      `
    );

    return NextResponse.json({
      success: true,
      data: rows.map((row) => ({
        boardBasisId: Number(row.boardBasisId),
        boardBasisCode: row.boardBasisCode,
        boardBasisName: row.boardBasisName,
        sortOrder: Number(row.sortOrder),
        isActive: Boolean(row.isActive),
      })),
    });
  } catch (error) {
    console.error("GET /api/board-basis failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load board basis master.",
      },
      { status: 500 }
    );
  }
}
