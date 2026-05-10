import { NextRequest, NextResponse } from "next/server";
import { executeQuery, queryRows, sql } from "@/lib/db-exec";

export async function GET() {
  try {
    const rows = await queryRows(`
      SELECT board_basis_id AS boardBasisId, board_basis_code AS boardBasisCode, board_basis_name AS boardBasisName, sort_order AS sortOrder, is_active AS isActive
      FROM hotel.board_basis
      ORDER BY sort_order, board_basis_name
    `);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("GET /api/master-data/board-basis failed", error);
    return NextResponse.json({ success: false, error: "Failed to load board basis." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { boardBasisCode: string; boardBasisName: string; sortOrder: number; isActive: boolean; };
    const result = await executeQuery(`
      INSERT INTO hotel.board_basis (board_basis_code, board_basis_name, sort_order, is_active)
      OUTPUT INSERTED.board_basis_id AS boardBasisId, INSERTED.board_basis_code AS boardBasisCode, INSERTED.board_basis_name AS boardBasisName, INSERTED.sort_order AS sortOrder, INSERTED.is_active AS isActive
      VALUES (@BoardBasisCode, @BoardBasisName, @SortOrder, @IsActive)
    `, [
      { name: "BoardBasisCode", type: sql.NVarChar(30), value: body.boardBasisCode.trim() },
      { name: "BoardBasisName", type: sql.NVarChar(80), value: body.boardBasisName.trim() },
      { name: "SortOrder", type: sql.Int, value: Number(body.sortOrder ?? 1) },
      { name: "IsActive", type: sql.Bit, value: Boolean(body.isActive) },
    ]);
    return NextResponse.json({ success: true, data: result.recordset[0] ?? null });
  } catch (error) {
    console.error("POST /api/master-data/board-basis failed", error);
    return NextResponse.json({ success: false, error: "Failed to create board basis." }, { status: 500 });
  }
}
