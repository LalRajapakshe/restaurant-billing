"use client";

import { useEffect, useMemo, useState } from "react";
import { BedDouble, CalendarClock, Hotel, Sparkles } from "lucide-react";

import CheckoutPanel from "@/components/front-office/checkout-panel";
import RoomAllocationForm from "@/components/front-office/room-allocation-form";
import RoomList from "@/components/front-office/room-list";
import RoomSummaryCard from "@/components/front-office/room-summary-card";
import AppShell from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { mockRooms } from "@/data/mock-rooms";
import { RoomPayload, RoomRecord, RoomStatus } from "@/types/room";

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

function toneClasses(tone: MessageTone) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function canWorkOnRoom(status?: RoomStatus) {
  return status === "Vacant Ready" || status === "Reserved" || status === "Occupied";
}

function createEmptyRoomForm(room?: RoomRecord | null): RoomPayload {
  const today = todayIsoDate();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return {
    id: room?.id,
    roomNo: room?.roomNo ?? "",
    roomType: room?.roomType ?? "",
    floor: room?.floor ?? "",
    rate: room?.rate ?? 0,
    status:
      room?.status === "Occupied"
        ? "Occupied"
        : room?.status === "Reserved"
          ? "Reserved"
          : "Reserved",
    reservationId: room?.reservationId ?? "",
    guestName: room?.guestName ?? "",
    mobile: room?.mobile ?? "",
    arrivalDate: room?.arrivalDate || today,
    departureDate: room?.departureDate || tomorrow,
    adults: room?.adults && room.adults > 0 ? room.adults : 2,
    children: room?.children ?? 0,
    boardBasis: room?.boardBasis ?? "Room Only",
    notes: room?.notes ?? "",
    housekeepingNote: room?.housekeepingNote ?? "",
    lastCleanedBy: room?.lastCleanedBy ?? "",
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

export default function FrontOfficePage() {
  const [rooms, setRooms] = useState<RoomRecord[]>(mockRooms);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(mockRooms[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<RoomStatus | "All">("All");
  const [apiMode, setApiMode] = useState<ApiMode>("loading");
  const [formMode, setFormMode] = useState<"allocate" | "update">("allocate");
  const [form, setForm] = useState<RoomPayload>(createEmptyRoomForm(mockRooms[0]));
  const [message, setMessage] = useState<{ tone: MessageTone; text: string } | null>({
    tone: "info",
    text: "Connecting to mock room API routes for initial room utilization load...",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadRooms() {
      try {
        const response = await fetch("/api/rooms", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Room API failed");
        }

        const json = await response.json();
        const nextRooms = Array.isArray(json?.data)
          ? (json.data as RoomRecord[])
          : mockRooms;

        if (!isMounted) return;

        setRooms(nextRooms);
        setSelectedRoomId(nextRooms[0]?.id ?? "");
        setForm(createEmptyRoomForm(nextRooms[0] ?? null));
        setApiMode("connected");
        setMessage({
          tone: "info",
          text: "Front Office room data loaded from mock API. Allocation, checkout, and room-state demo updates are active.",
        });
      } catch {
        if (!isMounted) return;

        setRooms(mockRooms);
        setSelectedRoomId(mockRooms[0]?.id ?? "");
        setForm(createEmptyRoomForm(mockRooms[0] ?? null));
        setApiMode("fallback");
        setMessage({
          tone: "warning",
          text: "Using local fallback room data. The room utilization demo remains fully usable.",
        });
      }
    }

    loadRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedRoom =
    rooms.find((item) => item.id === selectedRoomId) ?? null;

  const filteredRooms = useMemo(() => {
    return rooms.filter((item) => {
      const matchesFilter = activeFilter === "All" ? true : item.status === activeFilter;
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        item.roomNo.toLowerCase().includes(q) ||
        item.roomType.toLowerCase().includes(q) ||
        item.guestName.toLowerCase().includes(q) ||
        item.reservationId.toLowerCase().includes(q) ||
        item.floor.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [rooms, activeFilter, search]);

  const vacantReadyCount = rooms.filter((item) => item.status === "Vacant Ready").length;
  const reservedCount = rooms.filter((item) => item.status === "Reserved").length;
  const occupiedCount = rooms.filter((item) => item.status === "Occupied").length;
  const dirtyCount = rooms.filter((item) => item.status === "Dirty").length;

  function showMessage(text: string, tone: MessageTone = "success") {
    setMessage({ text, tone });
  }

  function startPrepareAllocation() {
    if (!selectedRoom) {
      showMessage("Select a room first.", "warning");
      return;
    }

    if (!canWorkOnRoom(selectedRoom.status)) {
      showMessage("This room cannot be allocated from front office right now.", "warning");
      return;
    }

    setFormMode(selectedRoom.status === "Occupied" ? "update" : "allocate");
    setForm(createEmptyRoomForm(selectedRoom));
  }

  function resetForm() {
    setForm(createEmptyRoomForm(selectedRoom));
    setFormMode(selectedRoom?.status === "Occupied" ? "update" : "allocate");
  }

  function updateForm<K extends keyof RoomPayload>(
    field: K,
    value: RoomPayload[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm() {
    if (!selectedRoom) {
      showMessage("Please select a room before saving allocation.", "warning");
      return false;
    }

    if (!form.guestName?.trim()) {
      showMessage("Guest name is required.", "warning");
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

    if (!canWorkOnRoom(selectedRoom.status)) {
      showMessage("This room status is not available for front office allocation.", "warning");
      return false;
    }

    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedRoom || !validateForm()) return;

    const nights = calculateNights(form.arrivalDate, form.departureDate);
    const normalized: RoomRecord = {
      id: selectedRoom.id,
      roomNo: selectedRoom.roomNo,
      roomType: form.roomType?.trim() || selectedRoom.roomType,
      floor: form.floor?.trim() || selectedRoom.floor,
      rate: Number(form.rate ?? selectedRoom.rate),
      status: (form.status ?? "Reserved") as RoomStatus,
      reservationId: form.reservationId?.trim() ?? "",
      guestName: form.guestName?.trim() ?? "",
      mobile: form.mobile?.trim() ?? "",
      arrivalDate: form.arrivalDate ?? "",
      departureDate: form.departureDate ?? "",
      nights,
      adults: Number(form.adults ?? 1),
      children: Number(form.children ?? 0),
      boardBasis: form.boardBasis ?? "Room Only",
      notes: form.notes?.trim() ?? "",
      housekeepingNote: selectedRoom.housekeepingNote,
      lastCleanedBy: selectedRoom.lastCleanedBy,
    };

    setRooms((prev) =>
      prev.map((item) => (item.id === selectedRoom.id ? normalized : item))
    );
    setSelectedRoomId(normalized.id);
    setFormMode("update");
    setForm(createEmptyRoomForm(normalized));

    fireAndForget(`/api/rooms/${normalized.id}`, normalized, "PUT");

    showMessage(
      normalized.status === "Occupied"
        ? `Room ${normalized.roomNo} checked in for ${normalized.guestName}.`
        : `Room ${normalized.roomNo} reserved for ${normalized.guestName}.`,
      "success"
    );
  }

  function handleCheckout() {
    if (!selectedRoom) {
      showMessage("Select an occupied room before checkout.", "warning");
      return;
    }

    if (selectedRoom.status !== "Occupied") {
      showMessage("Only occupied rooms can be checked out.", "warning");
      return;
    }

    const checkedOutRoom: RoomRecord = {
      ...selectedRoom,
      status: "Dirty",
      reservationId: "",
      guestName: "",
      mobile: "",
      arrivalDate: "",
      departureDate: "",
      nights: 0,
      adults: 0,
      children: 0,
      boardBasis: "Room Only",
      notes: "",
      housekeepingNote: "Departure completed. Cleaning required.",
      lastCleanedBy: "",
    };

    setRooms((prev) =>
      prev.map((item) => (item.id === selectedRoom.id ? checkedOutRoom : item))
    );
    setSelectedRoomId(checkedOutRoom.id);
    setForm(createEmptyRoomForm(checkedOutRoom));
    setFormMode("allocate");

    fireAndForget(`/api/rooms/${checkedOutRoom.id}`, checkedOutRoom, "PUT");
    fireAndForget("/api/housekeeping", {
      roomId: checkedOutRoom.id,
      roomNo: checkedOutRoom.roomNo,
      roomType: checkedOutRoom.roomType,
      floor: checkedOutRoom.floor,
      status: "Dirty",
      assignedTo: "",
      cleanedBy: "",
      note: "Generated from front office checkout. Cleaning required.",
      createdAt: new Date().toISOString(),
      completedAt: "",
    }, "POST");

    showMessage(
      `Checkout completed for Room ${checkedOutRoom.roomNo}. Room status changed to Dirty and housekeeping task was created.`,
      "success"
    );
  }

  const summaryCards = [
    {
      label: "Vacant Ready",
      value: String(vacantReadyCount),
      helper: "Available for immediate allocation",
      icon: Hotel,
    },
    {
      label: "Reserved",
      value: String(reservedCount),
      helper: "Expected arrivals waiting for check-in",
      icon: CalendarClock,
    },
    {
      label: "Occupied",
      value: String(occupiedCount),
      helper: "Current in-house rooms",
      icon: BedDouble,
    },
    {
      label: "Dirty",
      value: String(dirtyCount),
      helper: "Ready for housekeeping turnover",
      icon: Sparkles,
    },
  ];

  return (
    <AppShell
      title="Front Office / Room Utilization"
      description="Sprint 5 front office flow adds checkout and dirty-room handover while keeping room card visibility and allocation behavior."
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

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr_1fr]">
        <RoomList
          rooms={filteredRooms}
          activeRoomId={selectedRoom?.id ?? null}
          search={search}
          onSearchChange={setSearch}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onSelectRoom={(roomId) => {
            setSelectedRoomId(roomId);
            const nextRoom = rooms.find((item) => item.id === roomId) ?? null;
            setForm(createEmptyRoomForm(nextRoom));
            setFormMode(nextRoom?.status === "Occupied" ? "update" : "allocate");
          }}
        />

        <RoomSummaryCard
          room={selectedRoom}
          currency={currency}
          onPrepareAllocation={startPrepareAllocation}
        />

        <div className="space-y-6">
          <RoomAllocationForm
            selectedRoomNo={selectedRoom?.roomNo ?? ""}
            selectedRoomType={selectedRoom?.roomType ?? ""}
            mode={formMode}
            form={form}
            onChange={updateForm}
            onSubmit={handleSubmit}
            onReset={resetForm}
          />

          <CheckoutPanel
            room={selectedRoom}
            currency={currency}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white/90 p-4 text-xs text-slate-500 shadow-sm">
        API mode: <span className="font-medium text-slate-700">{apiMode}</span>. This sprint extends
        front office with checkout and dirty-room turnover handoff to housekeeping.
      </div>
    </AppShell>
  );
}
