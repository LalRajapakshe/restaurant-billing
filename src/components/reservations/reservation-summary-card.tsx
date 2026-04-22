"use client";

import { CalendarDays, Hotel, Mail, Phone, Users, Wallet } from "lucide-react";

import PanelShell from "@/components/shared/panel-shell";
import ReservationStatusBadge from "@/components/reservations/reservation-status-badge";
import { Button } from "@/components/ui/button";
import { ReservationRecord } from "@/types/reservation";

type ReservationSummaryCardProps = {
  reservation: ReservationRecord | null;
  currency: (value: number) => string;
  onNewReservation: () => void;
  onEditReservation: () => void;
};

export default function ReservationSummaryCard({
  reservation,
  currency,
  onNewReservation,
  onEditReservation,
}: ReservationSummaryCardProps) {
  return (
    <PanelShell
      title={reservation?.guestName ?? "No Reservation Selected"}
      description={
        reservation
          ? `${reservation.id} • ${reservation.roomType}`
          : "Select a reservation from the list to review details."
      }
      summary={reservation ? <ReservationStatusBadge status={reservation.status} /> : null}
      headerRight={
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-2xl bg-white" onClick={onNewReservation}>
            New Reservation
          </Button>
          <Button
            className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
            onClick={onEditReservation}
            disabled={!reservation}
          >
            Edit Selected
          </Button>
        </div>
      }
      minimizedContent={
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {reservation ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">{reservation.id}</p>
                <p className="mt-1 text-slate-500">
                  {reservation.arrivalDate} → {reservation.departureDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Estimate</p>
                <p className="font-semibold text-slate-900">{currency(reservation.totalEstimate)}</p>
              </div>
            </div>
          ) : (
            <div className="text-slate-500">No reservation selected.</div>
          )}
        </div>
      }
    >
      {reservation ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Stay Dates</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                {reservation.arrivalDate} → {reservation.departureDate}
              </div>
              <p className="mt-2 text-sm text-slate-500">{reservation.nights} nights</p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Contact</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                <Phone className="h-4 w-4 text-slate-500" />
                {reservation.mobile}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4 text-slate-500" />
                {reservation.email || "No email"}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Occupancy</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                <Users className="h-4 w-4 text-slate-500" />
                {reservation.adults} adults / {reservation.children} children
              </div>
              <p className="mt-2 text-sm text-slate-500">{reservation.boardBasis}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Room / Type</p>
              <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Hotel className="h-5 w-5 text-slate-500" />
                {reservation.roomNo ? `${reservation.roomNo} • ` : ""}
                {reservation.roomType}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Advance Payment</p>
              <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-emerald-800">
                <Wallet className="h-5 w-5" />
                {currency(reservation.advancePayment)}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-700">Estimated Value</p>
              <p className="mt-2 text-2xl font-semibold text-amber-800">
                {currency(reservation.totalEstimate)}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-900">Reservation Notes</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {reservation.notes || "No notes added."}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          No reservation selected.
        </div>
      )}
    </PanelShell>
  );
}
