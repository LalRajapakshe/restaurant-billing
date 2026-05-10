import { NextRequest, NextResponse } from "next/server";
import { executeQuery, queryRows, sql } from "@/lib/db-exec";

type RouteContext = { params: Promise<{ boardBasisId: string }>; };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { boardBasisId } = await params;
    const id = Number(boardBasisId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "Invalid board basis id." }, { status: 400 });
    }
    const body = (await request.json()) as { boardBasisCode: string; boardBasisName: string; sortOrder: number; isActive: boolean; };
    await executeQuery(`
      UPDATE hotel.board_basis
      SET board_basis_code = @BoardBasisCode, board_basis_name = @BoardBasisName, sort_order = @SortOrder, is_active = @IsActive
      WHERE board_basis_id = @BoardBasisId
    `, [
      { name: "BoardBasisId", type: sql.Int, value: id },
      { name: "BoardBasisCode", type: sql.NVarChar(30), value: body.boardBasisCode.trim() },
      { name: "BoardBasisName", type: sql.NVarChar(80), value: body.boardBasisName.trim() },
      { name: "SortOrder", type: sql.Int, value: Number(body.sortOrder ?? 1) },
      { name: "IsActive", type: sql.Bit, value: Boolean(body.isActive) },
    ]);
    const rows = await queryRows(`
      SELECT board_basis_id AS boardBasisId, board_basis_code AS boardBasisCode, board_basis_name AS boardBasisName, sort_order AS sortOrder, is_active AS isActive
      FROM hotel.board_basis
      WHERE board_basis_id = @BoardBasisId
    `, [{ name: "BoardBasisId", type: sql.Int, value: id }]);
    return NextResponse.json({ success: true, data: rows[0] ?? null });
  } catch (error) {
    console.error("PUT /api/master-data/board-basis/[boardBasisId] failed", error);
    return NextResponse.json({ success: false, error: "Failed to update board basis." }, { status: 500 });
  }
}
