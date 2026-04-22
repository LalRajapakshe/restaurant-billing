"use client";

import { CalendarDays, Search, Users } from "lucide-react";

import PanelShell from "@/components/shared/panel-shell";
import ReservationStatusBadge from "@/components/reservations/reservation-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReservationRecord, ReservationStatus } from "@/types/reservation";

type ReservationListProps = {
  reservations: ReservationRecord[];
  activeReservationId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: ReservationStatus | "All";
  onFilterChange: (value: ReservationStatus | "All") => void;
  onSelectReservation: (reservationId: string) => void;
};

const filters: Array<ReservationStatus | "All"> = [
  "All",
  "Tentative",
  "Confirmed",
  "Checked In",
  "Checked Out",
  "Cancelled",
  "No Show",
];

export default function ReservationList({
  reservations,
  activeReservationId,
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onSelectReservation,
}: ReservationListProps) {
  return (
    <PanelShell
      title="Reservation List"
      description="Booking queue for arrivals, departures, status updates, and guest planning."
      minimizedContent={
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">{reservations.length} reservations visible</p>
              <p className="mt-1 text-slate-500">
                Active filter: <span className="font-medium text-slate-700">{activeFilter}</span>
              </p>
            </div>
            {activeReservationId ? (
              <div className="text-right">
                <p className="text-xs text-slate-500">Selected</p>
                <p className="font-semibold text-slate-900">{activeReservationId}</p>
              </div>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by reservation no, guest, mobile, room type"
            className="h-11 rounded-2xl bg-white pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              className={`rounded-2xl ${
                activeFilter === filter ? "bg-slate-900 text-white" : "bg-white"
              }`}
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>

        <div className="max-h-[760px] space-y-4 overflow-auto pb-2">
          {reservations.length > 0 ? (
            reservations.map((reservation) => {
              const active = activeReservationId === reservation.id;

              return (
                <button
                  key={reservation.id}
                  onClick={() => onSelectReservation(reservation.id)}
                  className={`w-full rounded-3xl border p-4 text-left shadow-sm transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <ReservationStatusBadge status={reservation.status} />
                        <span className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                          {reservation.id}
                        </span>
                      </div>
                      <p className={`mt-3 text-lg font-semibold ${active ? "text-white" : "text-slate-900"}`}>
                        {reservation.guestName}
                      </p>
                      <p className={`text-sm ${active ? "text-slate-300" : "text-slate-500"}`}>
                        {reservation.roomType}
                      </p>
                    </div>

                    <div className={`rounded-2xl px-3 py-2 text-right ${active ? "bg-white/10" : "bg-slate-50"}`}>
                      <p className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>Board Basis</p>
                      <p className={`text-sm font-semibold ${active ? "text-white" : "text-slate-900"}`}>
                        {reservation.boardBasis}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                    <div>
                      <p className={active ? "text-slate-400" : "text-slate-500"}>Stay</p>
                      <div className={`mt-1 flex items-center gap-2 font-medium ${active ? "text-white" : "text-slate-900"}`}>
                        <CalendarDays className="h-4 w-4" />
                        {reservation.arrivalDate}
                      </div>
                    </div>
                    <div>
                      <p className={active ? "text-slate-400" : "text-slate-500"}>Nights</p>
                      <p className={`mt-1 font-medium ${active ? "text-white" : "text-slate-900"}`}>
                        {reservation.nights}
                      </p>
                    </div>
                    <div>
                      <p className={active ? "text-slate-400" : "text-slate-500"}>Guests</p>
                      <div className={`mt-1 flex items-center gap-2 font-medium ${active ? "text-white" : "text-slate-900"}`}>
                        <Users className="h-4 w-4" />
                        {reservation.adults + reservation.children}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No reservations match the current search/filter.
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}
