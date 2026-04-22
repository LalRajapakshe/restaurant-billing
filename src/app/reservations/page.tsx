"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ClipboardList, Hotel, Users } from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import ReservationForm from "@/components/reservations/reservation-form";
import ReservationList from "@/components/reservations/reservation-list";
import ReservationSummaryCard from "@/components/reservations/reservation-summary-card";
import { Card, CardContent } from "@/components/ui/card";
import { mockReservations } from "@/data/mock-reservations";
import {
  ReservationPayload,
  ReservationRecord,
  ReservationStatus,
} from "@/types/reservation";

type ApiMode = "loading" | "connected" | "fallback";
type MessageTone = "success" | "warning" | "info";

function currency(value: number) {
  return `LKR ${value.toLocaleString()}`;
}

function calculateNights(arrivalDate?: string, departureDate?: string) {
  if (!arrivalDate || !departureDate) return 0;

  const start = new Date(arrivalDate);
  const end = new Date(departureDate);
  const diff = end.getTime() - start.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  return Number.isFinite(days) && days > 0 ? days : 0;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function toneClasses(tone: MessageTone) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function createEmptyReservationForm(): ReservationPayload {
  const today = todayIsoDate();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return {
    guestName: "",
    mobile: "",
    email: "",
    arrivalDate: today,
    departureDate: tomorrow,
    roomType: "Deluxe Double",
    roomNo: "",
    adults: 2,
    children: 0,
    boardBasis: "Room Only",
    advancePayment: 0,
    totalEstimate: 0,
    status: "Tentative",
    notes: "",
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

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRecord[]>(mockReservations);
  const [selectedReservationId, setSelectedReservationId] = useState<string>(mockReservations[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ReservationStatus | "All">("All");
  const [apiMode, setApiMode] = useState<ApiMode>("loading");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<ReservationPayload>(createEmptyReservationForm());
  const [message, setMessage] = useState<{ tone: MessageTone; text: string } | null>({
    tone: "info",
    text: "Connecting to mock reservation API routes for initial data load...",
  });

  useEffect(() => {
    let isMounted = true

    async function loadReservations() {
      try {
        const response = await fetch("/api/reservations", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Reservation API failed");
        }

        const json = await response.json();
        const nextReservations = Array.isArray(json?.data)
          ? (json.data as ReservationRecord[])
          : mockReservations;

        if (!isMounted) return;

        setReservations(nextReservations);
        setSelectedReservationId(nextReservations[0]?.id ?? "");
        setApiMode("connected");
        setMessage({
          tone: "info",
          text: "Reservations loaded from mock API. Save/update actions continue in demo mode.",
        });
      } catch {
        if (!isMounted) return;

        setReservations(mockReservations);
        setSelectedReservationId(mockReservations[0]?.id ?? "");
        setApiMode("fallback");
        setMessage({
          tone: "warning",
          text: "Using local fallback reservation data. The demo remains fully usable.",
        });
      }
    }

    loadReservations();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedReservation =
    reservations.find((item) => item.id === selectedReservationId) ?? null;

  const filteredReservations = useMemo(() => {
    return reservations.filter((item) => {
      const matchesFilter = activeFilter === "All" ? true : item.status === activeFilter;
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.guestName.toLowerCase().includes(q) ||
        item.mobile.toLowerCase().includes(q) ||
        item.roomType.toLowerCase().includes(q) ||
        item.boardBasis.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [reservations, activeFilter, search]);

  const tentativeCount = reservations.filter((item) => item.status === "Tentative").length;
  const confirmedCount = reservations.filter((item) => item.status === "Confirmed").length;
  const inHouseCount = reservations.filter((item) => item.status === "Checked In").length;
  const arrivalsCount = reservations.filter((item) => item.arrivalDate === todayIsoDate()).length;

  function showMessage(text: string, tone: MessageTone = "success") {
    setMessage({ text, tone });
  }

  function startNewReservation() {
    setFormMode("create");
    setForm(createEmptyReservationForm());
  }

  function startEditReservation() {
    if (!selectedReservation) return;

    setFormMode("edit");
    setForm({
      id: selectedReservation.id,
      guestName: selectedReservation.guestName,
      mobile: selectedReservation.mobile,
      email: selectedReservation.email,
      arrivalDate: selectedReservation.arrivalDate,
      departureDate: selectedReservation.departureDate,
      roomType: selectedReservation.roomType,
      roomNo: selectedReservation.roomNo,
      adults: selectedReservation.adults,
      children: selectedReservation.children,
      boardBasis: selectedReservation.boardBasis,
      advancePayment: selectedReservation.advancePayment,
      totalEstimate: selectedReservation.totalEstimate,
      status: selectedReservation.status,
      notes: selectedReservation.notes,
      createdAt: selectedReservation.createdAt,
    });
  }

  function resetForm() {
    if (formMode === "edit" && selectedReservation) {
      startEditReservation();
      return;
    }

    startNewReservation();
  }

  function updateForm<K extends keyof ReservationPayload>(
    field: K,
    value: ReservationPayload[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm() {
    if (!form.guestName?.trim()) {
      showMessage("Guest name is required.", "warning");
      return false;
    }

    if (!form.mobile?.trim()) {
      showMessage("Mobile number is required.", "warning");
      return false;
    }

    if (!form.arrivalDate || !form.departureDate) {
      showMessage("Arrival and departure dates are required.", "warning");
      return false;
    }

    const nights = calculateNights(form.arrivalDate, form.departureDate);

    if (nights <= 0) {
      showMessage("Departure date must be after arrival date.", "warning");
      return false;
    }

    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    const nights = calculateNights(form.arrivalDate, form.departureDate);
    const normalized: ReservationRecord = {
      id:
        formMode === "edit" && form.id
          ? form.id
          : `RES-${10020 + reservations.length + 1}`,
      guestName: form.guestName?.trim() ?? "",
      mobile: form.mobile?.trim() ?? "",
      email: form.email?.trim() ?? "",
      arrivalDate: form.arrivalDate ?? "",
      departureDate: form.departureDate ?? "",
      nights,
      roomType: form.roomType?.trim() ?? "",
      roomNo: form.roomNo?.trim() ?? "",
      adults: Number(form.adults ?? 1),
      children: Number(form.children ?? 0),
      boardBasis: form.boardBasis ?? "Room Only",
      advancePayment: Number(form.advancePayment ?? 0),
      totalEstimate: Number(form.totalEstimate ?? 0),
      status: form.status ?? "Tentative",
      notes: form.notes?.trim() ?? "",
      createdAt: form.createdAt ?? new Date().toISOString(),
    };

    if (formMode === "edit" && form.id) {
      setReservations((prev) =>
        prev.map((item) => (item.id === form.id ? normalized : item))
      );
      setSelectedReservationId(normalized.id);
      fireAndForget(`/api/reservations/${normalized.id}`, normalized, "PUT");
      showMessage(`Reservation ${normalized.id} updated successfully.`, "success");
    } else {
      setReservations((prev) => [normalized, ...prev]);
      setSelectedReservationId(normalized.id);
      fireAndForget("/api/reservations", normalized, "POST");
      showMessage(`Reservation ${normalized.id} created successfully.`, "success");
    }

    setFormMode("edit");
    setForm({
      ...normalized,
    });
  }

  const summaryCards = [
    {
      label: "Arrivals Today",
      value: String(arrivalsCount),
      helper: "Expected arrivals based on reservation date",
      icon: CalendarClock,
    },
    {
      label: "Tentative",
      value: String(tentativeCount),
      helper: "Pending confirmation or follow-up",
      icon: ClipboardList,
    },
    {
      label: "Confirmed",
      value: String(confirmedCount),
      helper: "Approved bookings ready for allocation planning",
      icon: Hotel,
    },
    {
      label: "Checked In",
      value: String(inHouseCount),
      helper: "Already moved into in-house stay flow",
      icon: Users,
    },
  ];

  return (
    <AppShell
      title="Reservations"
      description="Sprint 2 reservation module using DB-ready mock contracts, shared operational panels, and hotel stay fields."
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

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr_0.95fr]">
        <ReservationList
          reservations={filteredReservations}
          activeReservationId={selectedReservation?.id ?? null}
          search={search}
          onSearchChange={setSearch}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onSelectReservation={setSelectedReservationId}
        />

        <ReservationSummaryCard
          reservation={selectedReservation}
          currency={currency}
          onNewReservation={startNewReservation}
          onEditReservation={startEditReservation}
        />

        <ReservationForm
          mode={formMode}
          form={form}
          onChange={updateForm}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white/90 p-4 text-xs text-slate-500 shadow-sm">
        API mode: <span className="font-medium text-slate-700">{apiMode}</span>. This sprint keeps the
        reservation UI and contracts DB-ready while still using mock API responses and local demo updates.
      </div>
    </AppShell>
  );
}
