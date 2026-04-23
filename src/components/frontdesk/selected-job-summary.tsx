"use client";

import React from "react";
import { Clock3, Phone, ReceiptText, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type JobStatus = "Open" | "Partially Paid" | "Ready to Close" | "Closed";

type ActiveJobSummary = {
  id: string;
  table: string;
  mobile: string;
  customer: string;
  openedAt: string;
  bills: number;
  subtotal: number;
  paid: number;
  balance: number;
  status: JobStatus;
} | null;

type SelectedJobSummaryProps = {
  activeJob: ActiveJobSummary;
  currency: (value: number) => string;
  onAddBill: () => void;
  onTakePayment: () => void;
};

function statusClasses(status: JobStatus) {
  if (status === "Closed") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (status === "Ready to Close") {
    return "bg-teal-50 text-teal-700 border-teal-200";
  }
  if (status === "Partially Paid") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export default function SelectedJobSummary({
  activeJob,
  currency,
  onAddBill,
  onTakePayment,
}: SelectedJobSummaryProps) {
  return (
    <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-[1.75rem] leading-none">
                {activeJob?.table ?? "No Job Selected"}
              </CardTitle>
              {activeJob ? (
                <Badge className={`rounded-full border px-3 py-1 ${statusClasses(activeJob.status)}`}>
                  {activeJob.status}
                </Badge>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {activeJob ? `${activeJob.id} • ${activeJob.customer}` : "Select a job card to continue"}
            </p>

            {activeJob ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                  <Phone className="h-3.5 w-3.5" />
                  {activeJob.mobile || "No mobile"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                  <Clock3 className="h-3.5 w-3.5" />
                  {activeJob.openedAt}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                  <ReceiptText className="h-3.5 w-3.5" />
                  {activeJob.bills} active bills
                </span>
              </div>
            ) : null}
          </div>

          {activeJob ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-2xl border-slate-200 bg-white"
                onClick={onAddBill}
                disabled={activeJob.status === "Closed"}
              >
                <ReceiptText className="mr-2 h-4 w-4" /> Add Bill
              </Button>
              <Button
                className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                onClick={onTakePayment}
                disabled={activeJob.bills === 0 || activeJob.status === "Closed"}
              >
                <Wallet className="mr-2 h-4 w-4" /> Take Payment
              </Button>
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        {activeJob ? (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Billed</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {currency(activeJob.subtotal)}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Total Paid</p>
                <p className="mt-1 text-xl font-semibold text-emerald-800">
                  {currency(activeJob.paid)}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Balance Due</p>
                <p className="mt-1 text-xl font-semibold text-amber-800">
                  {currency(activeJob.balance)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            No job selected.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
