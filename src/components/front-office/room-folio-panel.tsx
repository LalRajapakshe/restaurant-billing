"use client";

import { useMemo } from "react";
import { CreditCard, ReceiptText, Wallet } from "lucide-react";

import PanelShell from "@/components/shared/panel-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolioEntry, FolioPaymentMethod } from "@/types/folio";
import { RoomRecord } from "@/types/room";

type PaymentForm = {
  amount: string;
  method: Exclude<FolioPaymentMethod, "System">;
};

type RoomFolioPanelProps = {
  room: RoomRecord | null;
  entries: FolioEntry[];
  currency: (value: number) => string;
  paymentForm: PaymentForm;
  onPaymentFormChange: <K extends keyof PaymentForm>(field: K, value: PaymentForm[K]) => void;
  onApplyPayment: () => void;
  onOpenCheckout: () => void;
};

export default function RoomFolioPanel({
  room,
  entries,
  currency,
  paymentForm,
  onPaymentFormChange,
  onApplyPayment,
  onOpenCheckout,
}: RoomFolioPanelProps) {
  const chargesTotal = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.debit, 0),
    [entries]
  );
  const paymentsTotal = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.credit, 0),
    [entries]
  );
  const balance = chargesTotal - paymentsTotal;

  return (
    <PanelShell
      title="Room Folio"
      description="Front Office guest ledger for room charges, restaurant postings, payments, and final settlement."
      minimizedContent={
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {room ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">Room {room.roomNo}</p>
                <p className="mt-1 text-slate-500">{room.guestName || "No active guest"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Balance</p>
                <p className="font-semibold text-slate-900">{currency(balance)}</p>
              </div>
            </div>
          ) : (
            <div className="text-slate-500">No room selected.</div>
          )}
        </div>
      }
      headerRight={
        room ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-2xl bg-white"
              onClick={onOpenCheckout}
              disabled={room.status !== "Occupied"}
            >
              Go to Checkout
            </Button>
            <Button
              className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
              onClick={onApplyPayment}
              disabled={!room || balance <= 0}
            >
              Apply Payment
            </Button>
          </div>
        ) : null
      }
    >
      {room ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Total Charges</p>
              <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
                <ReceiptText className="h-5 w-5 text-slate-500" />
                {currency(chargesTotal)}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Payments</p>
              <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-emerald-800">
                <CreditCard className="h-5 w-5" />
                {currency(paymentsTotal)}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-700">Balance</p>
              <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-amber-800">
                <Wallet className="h-5 w-5" />
                {currency(balance)}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 p-4">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_180px_auto]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Amount</label>
                <Input
                  type="number"
                  min="1"
                  value={paymentForm.amount}
                  onChange={(e) => onPaymentFormChange("amount", e.target.value)}
                  className="h-11 rounded-2xl"
                  placeholder="Enter amount"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) =>
                    onPaymentFormChange(
                      "method",
                      e.target.value as PaymentForm["method"]
                    )
                  }
                  className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Entries</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{entries.length}</p>
              </div>

              <div className="flex items-end">
                <Button
                  className="h-11 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                  onClick={onApplyPayment}
                  disabled={balance <= 0}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <div className="grid grid-cols-[0.95fr_1.55fr_0.75fr_0.75fr_0.75fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <div>Time</div>
              <div>Description</div>
              <div>Source</div>
              <div className="text-right">Debit</div>
              <div className="text-right">Credit</div>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="grid grid-cols-[0.95fr_1.55fr_0.75fr_0.75fr_0.75fr] items-center px-4 py-3 text-sm text-slate-700"
                  >
                    <div>
                      {new Date(entry.postedAt).toLocaleDateString()}{" "}
                      {new Date(entry.postedAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{entry.description}</p>
                      <p className="text-xs text-slate-500">
                        {entry.outlet || entry.sourceModule}
                        {entry.sourceBillNo ? ` • ${entry.sourceBillNo}` : ""}
                        {entry.paymentMethod ? ` • ${entry.paymentMethod}` : ""}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500">
                      {entry.sourceModule === "frontoffice"
                        ? "FO Payment"
                        : entry.sourceModule === "restaurant"
                          ? "Restaurant"
                          : "Room"}
                    </div>
                    <div className="text-right font-medium text-slate-900">
                      {entry.debit > 0 ? currency(entry.debit) : "-"}
                    </div>
                    <div className="text-right font-medium text-emerald-700">
                      {entry.credit > 0 ? currency(entry.credit) : "-"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  No folio entries for this room yet.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          No room selected.
        </div>
      )}
    </PanelShell>
  );
}
