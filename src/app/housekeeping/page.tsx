"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  CheckCircle2,
  ClipboardList,
  Search,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type HousekeepingStatus = "Dirty" | "Cleaning In Progress" | "Ready";
type MessageTone = "success" | "warning" | "info";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type TaskRow = {
  housekeepingTaskId: number;
  roomId: number;
  roomNo: string;
  roomType: string;
  floorName: string;
  stayId?: number | null;
  stayNo?: string | null;
  guestName?: string | null;
  taskStatus: HousekeepingStatus;
  roomStatus: string;
  note?: string | null;
  createdAt: string;
  completedAt?: string | null;
};

const FILTERS: Array<HousekeepingStatus | "All"> = [
  "All",
  "Dirty",
  "Cleaning In Progress",
  "Ready",
];

function toneClasses(tone: MessageTone) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function statusBadgeClass(status: HousekeepingStatus) {
  switch (status) {
    case "Dirty":
      return "bg-rose-100 text-rose-700";
    case "Cleaning In Progress":
      return "bg-amber-100 text-amber-700";
    case "Ready":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const json = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok || !json.success) {
    throw new Error(json.error || "Request failed.");
  }

  return json.data;
}

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [taskDetail, setTaskDetail] = useState<TaskRow | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<HousekeepingStatus | "All">("All");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: MessageTone; text: string } | null>({
    tone: "info",
    text: "Housekeeping is now reading live tasks created by checkout and updating room readiness back to Front Office.",
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const filterOk = statusFilter === "All" ? true : task.taskStatus === statusFilter;
      const q = search.trim().toLowerCase();

      const searchOk =
        !q ||
        task.roomNo.toLowerCase().includes(q) ||
        task.roomType.toLowerCase().includes(q) ||
        (task.guestName ?? "").toLowerCase().includes(q) ||
        (task.stayNo ?? "").toLowerCase().includes(q);

      return filterOk && searchOk;
    });
  }, [tasks, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      dirty: tasks.filter((task) => task.taskStatus === "Dirty").length,
      cleaning: tasks.filter((task) => task.taskStatus === "Cleaning In Progress").length,
      ready: tasks.filter((task) => task.taskStatus === "Ready").length,
      total: tasks.length,
    };
  }, [tasks]);

  async function loadTasks(preferredTaskId?: number | null) {
    const query = new URLSearchParams();
    if (statusFilter !== "All") query.set("status", statusFilter);
    if (search.trim()) query.set("search", search.trim());

    const data = await readJson<TaskRow[]>(
      `/api/housekeeping${query.toString() ? `?${query.toString()}` : ""}`
    );

    setTasks(data);

    const nextActiveTaskId =
      preferredTaskId ??
      activeTaskId ??
      data[0]?.housekeepingTaskId ??
      null;

    setActiveTaskId(nextActiveTaskId);
  }

  async function loadTaskDetail(taskId: number) {
    const data = await readJson<TaskRow>(`/api/housekeeping/${taskId}`);
    setTaskDetail(data);
    setNote(data.note ?? "");
  }

  useEffect(() => {
    void (async () => {
      try {
        await loadTasks();
      } catch (error) {
        console.error("Failed to load housekeeping tasks", error);
        setMessage({
          tone: "warning",
          text: error instanceof Error ? error.message : "Failed to load housekeeping tasks.",
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!activeTaskId) {
      setTaskDetail(null);
      setNote("");
      return;
    }

    void (async () => {
      try {
        await loadTaskDetail(activeTaskId);
      } catch (error) {
        console.error("Failed to load housekeeping task detail", error);
        setMessage({
          tone: "warning",
          text: error instanceof Error ? error.message : "Failed to load housekeeping task detail.",
        });
      }
    })();
  }, [activeTaskId]);

  useEffect(() => {
    void loadTasks(activeTaskId);
  }, [statusFilter]);

  function showMessage(text: string, tone: MessageTone = "success") {
    setMessage({ text, tone });
  }

  async function applyTaskStatus(nextStatus: HousekeepingStatus) {
    if (!taskDetail) {
      showMessage("Select a housekeeping task first.", "warning");
      return;
    }

    setBusy(true);

    try {
      const updated = await readJson<TaskRow>(`/api/housekeeping/${taskDetail.housekeepingTaskId}`, {
        method: "PUT",
        body: JSON.stringify({
          taskStatus: nextStatus,
          note,
          assignedToUserId: null,
          cleanedByUserId: null,
        }),
      });

      await loadTasks(updated.housekeepingTaskId);
      setTaskDetail(updated);
      setNote(updated.note ?? "");

      showMessage(
        nextStatus === "Ready"
          ? `Room ${updated.roomNo} marked ready. Front Office will now see it as Vacant Ready.`
          : `Room ${updated.roomNo} updated to ${nextStatus}.`,
        "success"
      );
    } catch (error) {
      console.error("Failed to update housekeeping task", error);
      showMessage(
        error instanceof Error ? error.message : "Failed to update housekeeping task.",
        "warning"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title="Housekeeping"
      description="Live housekeeping task board with DB-backed status updates and room readiness synchronization."
    >
      {message ? (
        <div className={`mb-6 rounded-3xl border px-4 py-3 text-sm ${toneClasses(message.tone)}`}>
          {message.text}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Dirty",
            value: String(summary.dirty),
            helper: "Awaiting room turnover",
            icon: Sparkles,
          },
          {
            label: "Cleaning In Progress",
            value: String(summary.cleaning),
            helper: "Currently under housekeeping",
            icon: WandSparkles,
          },
          {
            label: "Ready",
            value: String(summary.ready),
            helper: "Completed and ready to release",
            icon: CheckCircle2,
          },
          {
            label: "Total Tasks",
            value: String(summary.total),
            helper: "Live task count from DB",
            icon: ClipboardList,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{card.helper}</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr]">
        <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardContent className="p-5">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[260px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by room, type, guest, stay"
                  className="h-11 rounded-2xl border-slate-200 bg-white pl-9"
                />
              </div>

              <Button
                variant="outline"
                className="h-11 rounded-2xl border-slate-300 bg-white"
                onClick={() => void loadTasks(activeTaskId)}
              >
                Refresh
              </Button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`rounded-2xl border px-4 py-2 text-sm ${
                    statusFilter === filter
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="max-h-[calc(100vh-24rem)] space-y-3 overflow-y-auto pr-1">
              {filteredTasks.map((task) => {
                const isActive = task.housekeepingTaskId === activeTaskId;

                return (
                  <button
                    key={task.housekeepingTaskId}
                    type="button"
                    onClick={() => setActiveTaskId(task.housekeepingTaskId)}
                    className={`w-full rounded-[24px] border p-4 text-left transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold">Room {task.roomNo}</p>
                        <p className={`mt-1 text-sm ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                          {task.roomType} • {task.floorName}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isActive ? "bg-white/10 text-white" : statusBadgeClass(task.taskStatus)
                        }`}
                      >
                        {task.taskStatus}
                      </span>
                    </div>

                    <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${isActive ? "text-slate-200" : "text-slate-600"}`}>
                      <div>
                        <p className="text-xs uppercase tracking-wide opacity-70">Guest / Stay</p>
                        <p className="mt-1 text-sm">{task.guestName || "No linked guest"}</p>
                        <p className="text-xs opacity-70">{task.stayNo || "No stay reference"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide opacity-70">Room Status</p>
                        <p className="mt-1 text-sm">{task.roomStatus}</p>
                        <p className="text-xs opacity-70">{task.createdAt}</p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredTasks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  No housekeeping tasks found for the selected filter.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardContent className="p-5">
            {taskDetail ? (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xl font-semibold text-slate-900">Room {taskDetail.roomNo}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {taskDetail.roomType} • {taskDetail.floorName}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={`rounded-full px-3 py-1.5 hover:bg-inherit ${statusBadgeClass(taskDetail.taskStatus)}`}>
                      {taskDetail.taskStatus}
                    </Badge>
                    <Badge className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-100">
                      Room {taskDetail.roomStatus}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Guest</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {taskDetail.guestName || "No linked guest"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{taskDetail.stayNo || "No stay reference"}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Task Created</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{taskDetail.createdAt}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {taskDetail.completedAt ? `Completed ${taskDetail.completedAt}` : "Not yet completed"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Room Status Sync</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{taskDetail.roomStatus}</p>
                    <p className="mt-1 text-xs text-slate-500">Front Office will read this status live</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Next Action</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {taskDetail.taskStatus === "Dirty"
                        ? "Start cleaning"
                        : taskDetail.taskStatus === "Cleaning In Progress"
                          ? "Mark room ready"
                          : "Ready for allocation"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Housekeeping Note</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[130px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    className="h-11 rounded-2xl bg-amber-600 text-white hover:bg-amber-700"
                    disabled={busy || taskDetail.taskStatus === "Cleaning In Progress"}
                    onClick={() => void applyTaskStatus("Cleaning In Progress")}
                  >
                    Start Cleaning
                  </Button>

                  <Button
                    type="button"
                    className="h-11 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
                    disabled={busy || taskDetail.taskStatus === "Ready"}
                    onClick={() => void applyTaskStatus("Ready")}
                  >
                    Mark Ready
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-2xl border-slate-300 bg-white"
                    disabled={busy}
                    onClick={() => void loadTaskDetail(taskDetail.housekeepingTaskId)}
                  >
                    Reload Task
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                Select a housekeeping task to view and update it.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
