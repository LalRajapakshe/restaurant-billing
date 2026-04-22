"use client";

import { AlertTriangle, ArrowRightLeft, BedDouble, CalendarDays, Wallet } from "lucide-react";

import PanelShell from "@/components/shared/panel-shell";
import { Button } from "@/components/ui/button";
import { RoomRecord } from "@/types/room";

type CheckoutPanelProps = {
  room: RoomRecord | null;
  currency: (value: number) => string;
  onCheckout: () => void;
};

export default function CheckoutPanel({
  room,
  currency,
  onCheckout,
}: CheckoutPanelProps) {
  const canCheckout = room?.status === "Occupied";

  return (
    <PanelShell
      title="Checkout / Departure"
      description="Departure settlement action for occupied rooms. Checkout moves the room to Dirty for housekeeping."
      minimizedContent={
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {room ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">Room {room.roomNo}</p>
                <p className="mt-1 text-slate-500">{room.guestName || "No active guest"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Status</p>
                <p className="font-semibold text-slate-900">{room.status}</p>
              </div>
            </div>
          ) : (
            <div className="text-slate-500">No room selected.</div>
          )}
        </div>
      }
    >
      {room ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Guest</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                <BedDouble className="h-4 w-4 text-slate-500" />
                {room.guestName || "No active guest"}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Stay</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                {room.arrivalDate || "-"} {room.departureDate ? `→ ${room.departureDate}` : ""}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Room Rate</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                <Wallet className="h-4 w-4 text-slate-500" />
                {currency(room.rate)}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">Departure rule</p>
                <p className="mt-1">
                  Completing checkout will move the room into <strong>Dirty</strong> status and prepare it for housekeeping turnover.
                </p>
              </div>
            </div>
          </div>

          <Button
            className="h-12 w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
            onClick={onCheckout}
            disabled={!canCheckout}
          >
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Complete Checkout
          </Button>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          No room selected.
        </div>
      )}
    </PanelShell>
  );
}
