"use client";

import { BedDouble, CalendarDays, Phone, StickyNote, Users, Wallet } from "lucide-react";

import PanelShell from "@/components/shared/panel-shell";
import RoomStatusBadge from "@/components/front-office/room-status-badge";
import { Button } from "@/components/ui/button";
import { RoomRecord } from "@/types/room";

type RoomSummaryCardProps = {
  room: RoomRecord | null;
  currency: (value: number) => string;
  onPrepareAllocation: () => void;
};

function canWorkOnRoom(status?: string) {
  return status === "Vacant Ready" || status === "Reserved" || status === "Occupied";
}

export default function RoomSummaryCard({
  room,
  currency,
  onPrepareAllocation,
}: RoomSummaryCardProps) {
  return (
    <PanelShell
      title={room ? `Room ${room.roomNo}` : "No Room Selected"}
      description={
        room
          ? `${room.roomType} • ${room.floor}`
          : "Select a room from the list to review stay details."
      }
      summary={room ? <RoomStatusBadge status={room.status} /> : null}
      headerRight={
        <div className="flex gap-2">
          <Button
            className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
            onClick={onPrepareAllocation}
            disabled={!room || !canWorkOnRoom(room.status)}
          >
            {room?.status === "Occupied" ? "Edit Stay" : "Prepare Allocation"}
          </Button>
        </div>
      }
      minimizedContent={
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {room ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">Room {room.roomNo}</p>
                <p className="mt-1 text-slate-500">{room.roomType}</p>
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
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Room Details</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                <BedDouble className="h-4 w-4 text-slate-500" />
                {room.roomType}
              </div>
              <p className="mt-2 text-sm text-slate-500">{room.floor}</p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Stay Dates</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                {room.arrivalDate || "Not assigned"} {room.departureDate ? `→ ${room.departureDate}` : ""}
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {room.nights > 0 ? `${room.nights} nights` : "No active stay"}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Guest Contact</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                <Phone className="h-4 w-4 text-slate-500" />
                {room.mobile || "No mobile"}
              </div>
              <p className="mt-2 text-sm text-slate-500">{room.guestName || "No guest assigned"}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Rate</p>
              <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
                <Wallet className="h-5 w-5 text-slate-500" />
                {currency(room.rate)}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Occupancy</p>
              <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
                <Users className="h-5 w-5 text-slate-500" />
                {room.adults} / {room.children}
              </div>
              <p className="mt-2 text-sm text-slate-500">{room.boardBasis}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Reservation Ref</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {room.reservationId || "Walk-in"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <StickyNote className="mt-0.5 h-4 w-4 text-slate-500" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">Operational Notes</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {room.notes || room.housekeepingNote || "No notes added."}
                </p>
              </div>
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
