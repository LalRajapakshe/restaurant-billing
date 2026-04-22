"use client";

import { CheckCircle2, Sparkles, UserCheck } from "lucide-react";

import HousekeepingStatusBadge from "@/components/housekeeping/housekeeping-status-badge";
import PanelShell from "@/components/shared/panel-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HousekeepingTaskPayload, HousekeepingTaskRecord, housekeepingTaskStatuses } from "@/types/housekeeping";

type CleaningActionPanelProps = {
  task: HousekeepingTaskRecord | null;
  form: HousekeepingTaskPayload;
  onChange: <K extends keyof HousekeepingTaskPayload>(
    field: K,
    value: HousekeepingTaskPayload[K]
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onStartCleaning: () => void;
  onMarkReady: () => void;
};

export default function CleaningActionPanel({
  task,
  form,
  onChange,
  onSubmit,
  onReset,
  onStartCleaning,
  onMarkReady,
}: CleaningActionPanelProps) {
  return (
    <PanelShell
      title={task ? `Room ${task.roomNo} Housekeeping` : "No Task Selected"}
      description={
        task
          ? `${task.roomType} • ${task.floor}`
          : "Select a dirty-room task to assign or complete cleaning."
      }
      summary={task ? <HousekeepingStatusBadge status={task.status} /> : null}
      minimizedContent={
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {task ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">{task.id}</p>
                <p className="mt-1 text-slate-500">Room {task.roomNo}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Status</p>
                <p className="font-semibold text-slate-900">{task.status}</p>
              </div>
            </div>
          ) : (
            <div className="text-slate-500">No task selected.</div>
          )}
        </div>
      }
      headerRight={
        task ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-2xl bg-white"
              onClick={onStartCleaning}
              disabled={task.status !== "Dirty"}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start Cleaning
            </Button>
            <Button
              className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
              onClick={onMarkReady}
              disabled={task.status === "Ready"}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Ready
            </Button>
          </div>
        ) : null
      }
    >
      {task ? (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Assigned To</label>
              <Input
                value={form.assignedTo ?? ""}
                onChange={(e) => onChange("assignedTo", e.target.value)}
                className="h-11 rounded-2xl"
                placeholder="Cleaner / Housekeeper"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Cleaned By</label>
              <Input
                value={form.cleanedBy ?? ""}
                onChange={(e) => onChange("cleanedBy", e.target.value)}
                className="h-11 rounded-2xl"
                placeholder="Completed by"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                value={form.status ?? task.status}
                onChange={(e) =>
                  onChange("status", e.target.value as HousekeepingTaskPayload["status"])
                }
                className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {housekeepingTaskStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Task Context</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                <UserCheck className="h-4 w-4 text-slate-500" />
                Room {task.roomNo} • {task.roomType}
              </div>
              <p className="mt-2 text-sm text-slate-500">{task.floor}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Cleaning Notes</label>
            <textarea
              value={form.note ?? ""}
              onChange={(e) => onChange("note", e.target.value)}
              className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400"
              placeholder="Cleaning note, missing item check, linen status, inspection note..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
              Save Housekeeping Update
            </Button>
            <Button type="button" variant="outline" className="rounded-2xl bg-white" onClick={onReset}>
              Reset Form
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          No housekeeping task selected.
        </div>
      )}
    </PanelShell>
  );
}
