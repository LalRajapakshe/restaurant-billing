"use client";

import React from "react";
import { ChefHat, UtensilsCrossed, Wine } from "lucide-react";

import PanelShell from "@/components/shared/panel-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuestType, MealType, RestaurantBillType } from "@/types/restaurant";

type JobStatus = "Open" | "Partially Paid" | "Ready to Close" | "Closed";

type ActiveJobLight = {
  status: JobStatus;
  guestType: GuestType;
  roomNo?: string;
  outlet?: string;
} | null;

type FrontdeskBill = {
  billNo: string;
  type: RestaurantBillType;
  mealType?: MealType | null;
  guestType: GuestType;
  outlet: string;
  roomNo?: string;
  amount: number;
  paid: number;
  balance: number;
  createdAt: string;
  items: Array<{
    name: string;
    qty: number;
    amount: number;
  }>;
};

type BillListProps = {
  activeJob: ActiveJobLight;
  activeBills: FrontdeskBill[];
  currency: (value: number) => string;
  onNewKOTBill: () => void;
  onNewBOTBill: () => void;
  onNewMainMealBill: () => void;
  onPrintBill: (bill: FrontdeskBill) => void;
  onPayBill: (bill: FrontdeskBill) => void;
};

function BillTypeBadge({ type }: { type: RestaurantBillType }) {
  if (type === "KOT") {
    return (
      <Badge className="bg-teal-600 hover:bg-teal-600">
        <ChefHat className="mr-1 h-3.5 w-3.5" />
        {type}
      </Badge>
    );
  }

  if (type === "BOT") {
    return (
      <Badge className="bg-violet-600 hover:bg-violet-600">
        <Wine className="mr-1 h-3.5 w-3.5" />
        {type}
      </Badge>
    );
  }

  return (
    <Badge className="bg-amber-600 hover:bg-amber-600">
      <UtensilsCrossed className="mr-1 h-3.5 w-3.5" />
      {type}
    </Badge>
  );
}

export default function BillList({
  activeJob,
  activeBills,
  currency,
  onNewKOTBill,
  onNewBOTBill,
  onNewMainMealBill,
  onPrintBill,
  onPayBill,
}: BillListProps) {
  const isRoomGuest = activeJob?.guestType === "Room Guest";

  return (
    <PanelShell
      title="Bills Under Selected Job"
      description="KOT, BOT, and Main Meal now work in one hotel-aware restaurant billing flow."
      headerRight={
        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-2xl bg-teal-600 hover:bg-teal-700"
            onClick={onNewKOTBill}
            disabled={!activeJob || activeJob.status === "Closed"}
          >
            <ChefHat className="mr-2 h-4 w-4" /> New KOT Bill
          </Button>
          <Button
            className="rounded-2xl bg-violet-600 hover:bg-violet-700"
            onClick={onNewBOTBill}
            disabled={!activeJob || activeJob.status === "Closed"}
          >
            <Wine className="mr-2 h-4 w-4" /> New BOT Bill
          </Button>
          <Button
            className="rounded-2xl bg-amber-600 hover:bg-amber-700"
            onClick={onNewMainMealBill}
            disabled={!activeJob || activeJob.status === "Closed" || !isRoomGuest}
          >
            <UtensilsCrossed className="mr-2 h-4 w-4" /> Main Meal
          </Button>
        </div>
      }
      minimizedContent={
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">{activeBills.length} bills listed</p>
              <p className="mt-1 text-slate-500">
                {isRoomGuest ? "Room guest folio posting flow enabled." : "Direct restaurant settlement flow."}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Outstanding</p>
              <p className="font-semibold text-slate-900">
                {currency(activeBills.reduce((sum, bill) => sum + bill.balance, 0))}
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {activeBills.length > 0 ? (
          activeBills.map((bill) => (
            <div key={bill.billNo} className="rounded-[28px] border border-slate-200 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <BillTypeBadge type={bill.type} />
                    <span className="text-sm font-medium text-slate-700">{bill.billNo}</span>
                    <span className="text-xs text-slate-500">{bill.createdAt}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                      {bill.guestType}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                      {bill.outlet}
                    </span>
                    {bill.mealType ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
                        {bill.mealType}
                      </span>
                    ) : null}
                    {bill.roomNo ? (
                      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs text-sky-700">
                        Room {bill.roomNo}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Bill Amount</p>
                      <p className="mt-1 font-semibold text-slate-900">{currency(bill.amount)}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-3">
                      <p className="text-xs text-emerald-700">
                        {bill.guestType === "Room Guest" ? "Posted / Cleared" : "Paid"}
                      </p>
                      <p className="mt-1 font-semibold text-emerald-800">{currency(bill.paid)}</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-3">
                      <p className="text-xs text-amber-700">Balance</p>
                      <p className="mt-1 font-semibold text-amber-800">{currency(bill.balance)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white"
                    onClick={() => onPrintBill(bill)}
                  >
                    Print
                  </Button>
                  <Button
                    className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                    onClick={() => onPayBill(bill)}
                    disabled={bill.balance === 0 || activeJob?.status === "Closed"}
                  >
                    {isRoomGuest ? "Post to Folio" : "Pay This Bill"}
                  </Button>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
                <div className="grid grid-cols-[1.4fr_0.5fr_0.7fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <div>Item</div>
                  <div>Qty</div>
                  <div className="text-right">Amount</div>
                </div>

                {bill.items.map((item, idx) => (
                  <div
                    key={`${bill.billNo}-${item.name}-${idx}`}
                    className="grid grid-cols-[1.4fr_0.5fr_0.7fr] items-center px-4 py-3 text-sm text-slate-700"
                  >
                    <div>{item.name}</div>
                    <div>{item.qty}</div>
                    <div className="text-right font-medium">{currency(item.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            No bills yet for this job. Use the Add Bill action to create KOT, BOT, or Main Meal entries.
          </div>
        )}
      </div>
    </PanelShell>
  );
}
