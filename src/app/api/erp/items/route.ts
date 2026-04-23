import { NextRequest, NextResponse } from "next/server";

import { queryRows, sql } from "@/lib/db-exec";

type ItemRow = {
  itemId: number;
  itemCode: string | null;
  itemName: string | null;
  itemAlias: string | null;
  itemCategoryId: number | null;
  unitPrice: number | null;
};

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
    const likeSearch = `%${search}%`;

    const rows = await queryRows<ItemRow>(
      `
      SELECT TOP (200)
          IT_MST_CODE AS itemId,
          CAST(IT_MST_CODE AS VARCHAR(30)) AS itemCode,
          IT_MST_DESCRIPTION AS itemName,
          IT_MST_ALIAS AS itemAlias,
          IT_MST_MN_CAT_CODE AS itemCategoryId,
          IT_MST_TRAN_PRICE AS unitPrice
      FROM dbo.ITEM_MASTER
      WHERE ISNULL(IT_MST_DEACTIVATE, 'N') <> 'Y'
        AND (
          @Search = ''
          OR IT_MST_DESCRIPTION LIKE @LikeSearch
          OR IT_MST_ALIAS LIKE @LikeSearch
          OR CAST(IT_MST_CODE AS VARCHAR(30)) LIKE @LikeSearch
        )
      ORDER BY IT_MST_DESCRIPTION
      `,
      [
        { name: "Search", type: sql.VarChar(200), value: search },
        { name: "LikeSearch", type: sql.VarChar(210), value: likeSearch },
      ]
    );

    return NextResponse.json({
      success: true,
      data: rows.map((row) => ({
        itemId: Number(row.itemId),
        itemCode: row.itemCode ?? "",
        itemName: row.itemName ?? "",
        itemAlias: row.itemAlias ?? null,
        itemCategoryId: row.itemCategoryId ?? null,
        unitPrice: row.unitPrice != null ? Number(row.unitPrice) : null,
      })),
    });
  } catch (error) {
    console.error("GET /api/erp/items failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load item master records.",
      },
      { status: 500 }
    );
  }
}
