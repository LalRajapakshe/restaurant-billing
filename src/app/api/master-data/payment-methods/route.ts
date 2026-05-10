import { NextRequest, NextResponse } from "next/server";
import { executeQuery, queryRows, sql } from "@/lib/db-exec";

export async function GET() {
  try {
    const rows = await queryRows(`
      SELECT payment_method_id AS paymentMethodId, payment_method_code AS paymentMethodCode, payment_method_name AS paymentMethodName, sort_order AS sortOrder, is_active AS isActive, note
      FROM hotel.payment_method
      ORDER BY sort_order, payment_method_name
    `);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("GET /api/master-data/payment-methods failed", error);
    return NextResponse.json({ success: false, error: "Failed to load payment methods." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { paymentMethodCode: string; paymentMethodName: string; sortOrder: number; isActive: boolean; note?: string | null; };
    const result = await executeQuery(`
      INSERT INTO hotel.payment_method (payment_method_code, payment_method_name, sort_order, is_active, note)
      OUTPUT INSERTED.payment_method_id AS paymentMethodId, INSERTED.payment_method_code AS paymentMethodCode, INSERTED.payment_method_name AS paymentMethodName, INSERTED.sort_order AS sortOrder, INSERTED.is_active AS isActive, INSERTED.note AS note
      VALUES (@PaymentMethodCode, @PaymentMethodName, @SortOrder, @IsActive, @Note)
    `, [
      { name: "PaymentMethodCode", type: sql.NVarChar(30), value: body.paymentMethodCode.trim() },
      { name: "PaymentMethodName", type: sql.NVarChar(60), value: body.paymentMethodName.trim() },
      { name: "SortOrder", type: sql.Int, value: Number(body.sortOrder ?? 1) },
      { name: "IsActive", type: sql.Bit, value: Boolean(body.isActive) },
      { name: "Note", type: sql.NVarChar(500), value: body.note ?? null },
    ]);
    return NextResponse.json({ success: true, data: result.recordset[0] ?? null });
  } catch (error) {
    console.error("POST /api/master-data/payment-methods failed", error);
    return NextResponse.json({ success: false, error: "Failed to create payment method." }, { status: 500 });
  }
}
