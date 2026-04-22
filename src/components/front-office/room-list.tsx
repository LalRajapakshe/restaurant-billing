"use client";

import { BedDouble, Search, Users } from "lucide-react";

import PanelShell from "@/components/shared/panel-shell";
import RoomStatusBadge from "@/components/front-office/room-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoomRecord, RoomStatus } from "@/types/room";

type RoomListProps = {
  rooms: RoomRecord[];
  activeRoomId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: RoomStatus | "All";
  onFilterChange: (value: RoomStatus | "All") => void;
  onSelectRoom: (roomId: string) => void;
};

const filters: Array<RoomStatus | "All"> = [
  "All",
  "Vacant Ready",
  "Reserved",
  "Occupied",
  "Dirty",
  "Cleaning In Progress",
  "Out of Order",
];

export default function RoomList({
  rooms,
  activeRoomId,
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onSelectRoom,
}: RoomListProps) {
  return (
    <PanelShell
      title="Room Utilization"
      description="Operational room inventory with larger visual priority for allocation, occupancy, and turnover monitoring."
      minimizedContent={
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">{rooms.length} rooms visible</p>
              <p className="mt-1 text-slate-500">
                Active filter: <span className="font-medium text-slate-700">{activeFilter}</span>
              </p>
            </div>
            {activeRoomId ? (
              <div className="text-right">
                <p className="text-xs text-slate-500">Selected</p>
                <p className="font-semibold text-slate-900">{activeRoomId}</p>
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
            placeholder="Search by room no, guest, reservation, type"
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
          {rooms.length > 0 ? (
            rooms.map((room) => {
              const active = activeRoomId === room.id;

              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full rounded-3xl border p-4 text-left shadow-sm transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <RoomStatusBadge status={room.status} />
                        <span className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                          {room.id}
                        </span>
                      </div>
                      <p className={`mt-3 text-lg font-semibold ${active ? "text-white" : "text-slate-900"}`}>
                        Room {room.roomNo}
                      </p>
                      <p className={`text-sm ${active ? "text-slate-300" : "text-slate-500"}`}>
                        {room.roomType}
                      </p>
                    </div>

                    <div className={`rounded-2xl px-3 py-2 text-right ${active ? "bg-white/10" : "bg-slate-50"}`}>
                      <p className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>Rate</p>
                      <p className={`text-sm font-semibold ${active ? "text-white" : "text-slate-900"}`}>
                        LKR {room.rate.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                    <div>
                      <p className={active ? "text-slate-400" : "text-slate-500"}>Floor</p>
                      <div className={`mt-1 flex items-center gap-2 font-medium ${active ? "text-white" : "text-slate-900"}`}>
                        <BedDouble className="h-4 w-4" />
                        {room.floor}
                      </div>
                    </div>
                    <div>
                      <p className={active ? "text-slate-400" : "text-slate-500"}>Guest</p>
                      <p className={`mt-1 font-medium ${active ? "text-white" : "text-slate-900"}`}>
                        {room.guestName || "Vacant"}
                      </p>
                    </div>
                    <div>
                      <p className={active ? "text-slate-400" : "text-slate-500"}>Occupancy</p>
                      <div className={`mt-1 flex items-center gap-2 font-medium ${active ? "text-white" : "text-slate-900"}`}>
                        <Users className="h-4 w-4" />
                        {room.adults + room.children}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No rooms match the current search/filter.
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}
