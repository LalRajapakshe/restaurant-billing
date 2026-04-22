"use client";

import { BedDouble, Search, Sparkles } from "lucide-react";

import HousekeepingStatusBadge from "@/components/housekeeping/housekeeping-status-badge";
import PanelShell from "@/components/shared/panel-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HousekeepingTaskRecord, HousekeepingTaskStatus } from "@/types/housekeeping";

type DirtyRoomListProps = {
  tasks: HousekeepingTaskRecord[];
  activeTaskId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: HousekeepingTaskStatus | "All";
  onFilterChange: (value: HousekeepingTaskStatus | "All") => void;
  onSelectTask: (taskId: string) => void;
};

const filters: Array<HousekeepingTaskStatus | "All"> = [
  "All",
  "Dirty",
  "Cleaning In Progress",
  "Ready",
];

export default function DirtyRoomList({
  tasks,
  activeTaskId,
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onSelectTask,
}: DirtyRoomListProps) {
  return (
    <PanelShell
      title="Housekeeping Queue"
      description="Dirty rooms, cleaning progress, and ready-room completion in one operational view."
      minimizedContent={
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">{tasks.length} tasks visible</p>
              <p className="mt-1 text-slate-500">
                Active filter: <span className="font-medium text-slate-700">{activeFilter}</span>
              </p>
            </div>
            {activeTaskId ? (
              <div className="text-right">
                <p className="text-xs text-slate-500">Selected</p>
                <p className="font-semibold text-slate-900">{activeTaskId}</p>
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
            placeholder="Search by room no, type, floor, cleaner"
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
          {tasks.length > 0 ? (
            tasks.map((task) => {
              const active = activeTaskId === task.id;

              return (
                <button
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className={`w-full rounded-3xl border p-4 text-left shadow-sm transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <HousekeepingStatusBadge status={task.status} />
                        <span className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                          {task.id}
                        </span>
                      </div>
                      <p className={`mt-3 text-lg font-semibold ${active ? "text-white" : "text-slate-900"}`}>
                        Room {task.roomNo}
                      </p>
                      <p className={`text-sm ${active ? "text-slate-300" : "text-slate-500"}`}>
                        {task.roomType}
                      </p>
                    </div>

                    <div className={`rounded-2xl px-3 py-2 text-right ${active ? "bg-white/10" : "bg-slate-50"}`}>
                      <p className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>Floor</p>
                      <p className={`text-sm font-semibold ${active ? "text-white" : "text-slate-900"}`}>
                        {task.floor}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                    <div>
                      <p className={active ? "text-slate-400" : "text-slate-500"}>Assigned</p>
                      <div className={`mt-1 flex items-center gap-2 font-medium ${active ? "text-white" : "text-slate-900"}`}>
                        <Sparkles className="h-4 w-4" />
                        {task.assignedTo || "Unassigned"}
                      </div>
                    </div>
                    <div>
                      <p className={active ? "text-slate-400" : "text-slate-500"}>Cleaned By</p>
                      <p className={`mt-1 font-medium ${active ? "text-white" : "text-slate-900"}`}>
                        {task.cleanedBy || "-"}
                      </p>
                    </div>
                    <div>
                      <p className={active ? "text-slate-400" : "text-slate-500"}>Room</p>
                      <div className={`mt-1 flex items-center gap-2 font-medium ${active ? "text-white" : "text-slate-900"}`}>
                        <BedDouble className="h-4 w-4" />
                        {task.roomNo}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No housekeeping tasks match the current search/filter.
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}
