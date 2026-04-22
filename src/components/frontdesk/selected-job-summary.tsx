"use client";

import React from "react";
import { Building2, Clock3, Phone, ReceiptText, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuestType } from "@/types/restaurant";
import PanelShell from "@/components/shared/panel-shell";

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
  guestType: GuestType;
  outlet: string;
  roomNo?: string;
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
    <PanelShell
      title={activeJob?.table ?? "No Job Selected"}
      description={activeJob ? `${activeJob.id} • ${activeJob.customer}` : "Select a restaurant job to continue"}
      summary={
        activeJob ? (
          <div className="flex flex-wrap gap-2">
            <Badge className={`rounded-full border px-3 py-1 ${statusClasses(activeJob.status)}`}>
              {activeJob.status}
            </Badge>
            <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
              {activeJob.guestType}
            </Badge>
          </div>
        ) : null
      }
      headerRight={
        activeJob ? (
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
              <Wallet className="mr-2 h-4 w-4" />
              {activeJob.guestType === "Room Guest" ? "Post to Folio" : "Take Payment"}
            </Button>
          </div>
        ) : null
      }
      minimizedContent={
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {activeJob ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">{activeJob.id}</p>
                <p className="mt-1 text-slate-500">{activeJob.customer}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Balance</p>
                <p className="font-semibold text-slate-900">{currency(activeJob.balance)}</p>
              </div>
            </div>
          ) : (
            <div className="text-slate-500">No job selected.</div>
          )}
        </div>
      }
    >
      {activeJob ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Customer Mobile</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                <Phone className="h-4 w-4 text-slate-500" /> {activeJob.mobile || "No mobile"}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Opened Time</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                <Clock3 className="h-4 w-4 text-slate-500" /> {activeJob.openedAt}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Outlet</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                <Building2 className="h-4 w-4 text-slate-500" /> {activeJob.outlet}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Room Reference</p>
              <p className="mt-3 text-sm font-medium text-slate-900">
                {activeJob.roomNo ? `Room ${activeJob.roomNo}` : "FIT / Outside Guest"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Total Billed</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {currency(activeJob.subtotal)}
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">
                {activeJob.guestType === "Room Guest" ? "Posted / Cleared" : "Total Paid"}
              </p>
              <p className="mt-2 text-2xl font-semibold text-emerald-800">
                {currency(activeJob.paid)}
              </p>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-700">Balance Due</p>
              <p className="mt-2 text-2xl font-semibold text-amber-800">
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
    </PanelShell>
  );
}
