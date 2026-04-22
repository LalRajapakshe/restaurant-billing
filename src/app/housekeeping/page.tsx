"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Sparkles, TimerReset, Trash2 } from "lucide-react";

import CleaningActionPanel from "@/components/housekeeping/cleaning-action-panel";
import DirtyRoomList from "@/components/housekeeping/dirty-room-list";
import AppShell from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { mockHousekeepingTasks } from "@/data/mock-housekeeping-tasks";
import { HousekeepingTaskPayload, HousekeepingTaskRecord, HousekeepingTaskStatus } from "@/types/housekeeping";

type ApiMode = "loading" | "connected" | "fallback";
type MessageTone = "success" | "warning" | "info";

function toneClasses(tone: MessageTone) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function createForm(task?: HousekeepingTaskRecord | null): HousekeepingTaskPayload {
  return {
    id: task?.id,
    roomId: task?.roomId ?? "",
    roomNo: task?.roomNo ?? "",
    roomType: task?.roomType ?? "",
    floor: task?.floor ?? "",
    status: task?.status ?? "Dirty",
    assignedTo: task?.assignedTo ?? "",
    cleanedBy: task?.cleanedBy ?? "",
    note: task?.note ?? "",
    createdAt: task?.createdAt ?? new Date().toISOString(),
    completedAt: task?.completedAt ?? "",
  };
}

async function fireAndForget(url: string, payload: unknown, method: "POST" | "PUT") {
  void fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<HousekeepingTaskRecord[]>(mockHousekeepingTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(mockHousekeepingTasks[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<HousekeepingTaskStatus | "All">("All");
  const [apiMode, setApiMode] = useState<ApiMode>("loading");
  const [form, setForm] = useState<HousekeepingTaskPayload>(createForm(mockHousekeepingTasks[0]));
  const [message, setMessage] = useState<{ tone: MessageTone; text: string } | null>({
    tone: "info",
    text: "Connecting to mock housekeeping API routes for initial room turnover load...",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        const response = await fetch("/api/housekeeping", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Housekeeping API failed");
        }

        const json = await response.json();
        const nextTasks = Array.isArray(json?.data)
          ? (json.data as HousekeepingTaskRecord[])
          : mockHousekeepingTasks;

        if (!isMounted) return;

        setTasks(nextTasks);
        setSelectedTaskId(nextTasks[0]?.id ?? "");
        setForm(createForm(nextTasks[0] ?? null));
        setApiMode("connected");
        setMessage({
          tone: "info",
          text: "Housekeeping queue loaded from mock API. Cleaning updates continue in demo mode.",
        });
      } catch {
        if (!isMounted) return;

        setTasks(mockHousekeepingTasks);
        setSelectedTaskId(mockHousekeepingTasks[0]?.id ?? "");
        setForm(createForm(mockHousekeepingTasks[0] ?? null));
        setApiMode("fallback");
        setMessage({
          tone: "warning",
          text: "Using local fallback housekeeping data. The room-turnover demo remains fully usable.",
        });
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedTask = tasks.find((item) => item.id === selectedTaskId) ?? null;

  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => {
      const matchesFilter = activeFilter === "All" ? true : item.status === activeFilter;
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        item.roomNo.toLowerCase().includes(q) ||
        item.roomType.toLowerCase().includes(q) ||
        item.floor.toLowerCase().includes(q) ||
        item.assignedTo.toLowerCase().includes(q) ||
        item.cleanedBy.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [tasks, activeFilter, search]);

  const dirtyCount = tasks.filter((item) => item.status === "Dirty").length;
  const progressCount = tasks.filter((item) => item.status === "Cleaning In Progress").length;
  const readyCount = tasks.filter((item) => item.status === "Ready").length;

  function showMessage(text: string, tone: MessageTone = "success") {
    setMessage({ text, tone });
  }

  function updateForm<K extends keyof HousekeepingTaskPayload>(
    field: K,
    value: HousekeepingTaskPayload[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm(createForm(selectedTask));
  }

  function saveTask(nextTask: HousekeepingTaskRecord, actionText: string) {
    setTasks((prev) => prev.map((item) => (item.id === nextTask.id ? nextTask : item)));
    setSelectedTaskId(nextTask.id);
    setForm(createForm(nextTask));
    fireAndForget(`/api/housekeeping/${nextTask.id}`, nextTask, "PUT");
    showMessage(actionText, "success");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedTask) {
      showMessage("Select a housekeeping task first.", "warning");
      return;
    }

    const normalized: HousekeepingTaskRecord = {
      id: selectedTask.id,
      roomId: selectedTask.roomId,
      roomNo: selectedTask.roomNo,
      roomType: selectedTask.roomType,
      floor: selectedTask.floor,
      status: (form.status ?? selectedTask.status) as HousekeepingTaskStatus,
      assignedTo: form.assignedTo?.trim() ?? "",
      cleanedBy: form.cleanedBy?.trim() ?? "",
      note: form.note?.trim() ?? "",
      createdAt: selectedTask.createdAt,
      completedAt:
        form.status === "Ready"
          ? form.completedAt || new Date().toISOString()
          : "",
    };

    saveTask(normalized, `Housekeeping task ${normalized.id} saved successfully.`);
  }

  function handleStartCleaning() {
    if (!selectedTask) {
      showMessage("Select a housekeeping task first.", "warning");
      return;
    }

    const updated: HousekeepingTaskRecord = {
      ...selectedTask,
      status: "Cleaning In Progress",
      assignedTo: form.assignedTo?.trim() || selectedTask.assignedTo || "Assigned Cleaner",
      cleanedBy: form.cleanedBy?.trim() || "",
      note: form.note?.trim() || selectedTask.note,
      completedAt: "",
    };

    saveTask(updated, `Cleaning started for Room ${updated.roomNo}.`);
  }

  function handleMarkReady() {
    if (!selectedTask) {
      showMessage("Select a housekeeping task first.", "warning");
      return;
    }

    if (!(form.cleanedBy?.trim() || selectedTask.cleanedBy)) {
      showMessage("Enter cleaned by before marking the room ready.", "warning");
      return;
    }

    const updated: HousekeepingTaskRecord = {
      ...selectedTask,
      status: "Ready",
      assignedTo: form.assignedTo?.trim() || selectedTask.assignedTo,
      cleanedBy: form.cleanedBy?.trim() || selectedTask.cleanedBy,
      note: form.note?.trim() || selectedTask.note,
      completedAt: new Date().toISOString(),
    };

    saveTask(updated, `Room ${updated.roomNo} marked ready for next allocation.`);
  }

  const summaryCards = [
    {
      label: "Dirty",
      value: String(dirtyCount),
      helper: "Waiting for cleaning action",
      icon: Trash2,
    },
    {
      label: "Cleaning In Progress",
      value: String(progressCount),
      helper: "Currently under housekeeping action",
      icon: TimerReset,
    },
    {
      label: "Ready",
      value: String(readyCount),
      helper: "Returned to sale-ready state",
      icon: CheckCircle2,
    },
    {
      label: "Total Tasks",
      value: String(tasks.length),
      helper: "Current turnover queue visibility",
      icon: Sparkles,
    },
  ];

  return (
    <AppShell
      title="Housekeeping"
      description="Sprint 5 housekeeping module for dirty-room turnover, cleaner assignment, and ready-room updates."
    >
      {message ? (
        <div className={`mb-6 rounded-3xl border px-4 py-3 text-sm ${toneClasses(message.tone)}`}>
          {message.text}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
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

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DirtyRoomList
          tasks={filteredTasks}
          activeTaskId={selectedTask?.id ?? null}
          search={search}
          onSearchChange={setSearch}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onSelectTask={(taskId) => {
            setSelectedTaskId(taskId);
            const nextTask = tasks.find((item) => item.id === taskId) ?? null;
            setForm(createForm(nextTask));
          }}
        />

        <CleaningActionPanel
          task={selectedTask}
          form={form}
          onChange={updateForm}
          onSubmit={handleSubmit}
          onReset={resetForm}
          onStartCleaning={handleStartCleaning}
          onMarkReady={handleMarkReady}
        />
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white/90 p-4 text-xs text-slate-500 shadow-sm">
        API mode: <span className="font-medium text-slate-700">{apiMode}</span>. This sprint completes
        the dirty → cleaning → ready housekeeping loop for the hotel demo.
      </div>
    </AppShell>
  );
}
