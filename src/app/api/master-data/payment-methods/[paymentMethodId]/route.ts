import { NextRequest, NextResponse } from "next/server";
import { executeQuery, queryRows, sql } from "@/lib/db-exec";

type RouteContext = { params: Promise<{ paymentMethodId: string }>; };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { paymentMethodId } = await params;
    const id = Number(paymentMethodId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "Invalid payment method id." }, { status: 400 });
    }
    const body = (await request.json()) as { paymentMethodCode: string; paymentMethodName: string; sortOrder: number; isActive: boolean; note?: string | null; };
    await executeQuery(`
      UPDATE hotel.payment_method
      SET payment_method_code = @PaymentMethodCode, payment_method_name = @PaymentMethodName, sort_order = @SortOrder, is_active = @IsActive, note = @Note, updated_at = SYSDATETIME()
      WHERE payment_method_id = @PaymentMethodId
    `, [
      { name: "PaymentMethodId", type: sql.BigInt, value: id },
      { name: "PaymentMethodCode", type: sql.NVarChar(30), value: body.paymentMethodCode.trim() },
      { name: "PaymentMethodName", type: sql.NVarChar(60), value: body.paymentMethodName.trim() },
      { name: "SortOrder", type: sql.Int, value: Number(body.sortOrder ?? 1) },
      { name: "IsActive", type: sql.Bit, value: Boolean(body.isActive) },
      { name: "Note", type: sql.NVarChar(500), value: body.note ?? null },
    ]);
    const rows = await queryRows(`
      SELECT payment_method_id AS paymentMethodId, payment_method_code AS paymentMethodCode, payment_method_name AS paymentMethodName, sort_order AS sortOrder, is_active AS isActive, note
      FROM hotel.payment_method
      WHERE payment_method_id = @PaymentMethodId
    `, [{ name: "PaymentMethodId", type: sql.BigInt, value: id }]);
    return NextResponse.json({ success: true, data: rows[0] ?? null });
  } catch (error) {
    console.error("PUT /api/master-data/payment-methods/[paymentMethodId] failed", error);
    return NextResponse.json({ success: false, error: "Failed to update payment method." }, { status: 500 });
  }
}
