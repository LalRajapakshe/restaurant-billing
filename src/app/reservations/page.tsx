"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Hotel,
  Search,
  Users,
} from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ReservationStatus =
  | "Tentative"
  | "Confirmed"
  | "Checked In"
  | "Checked Out"
  | "Cancelled"
  | "No Show";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type ReservationRow = {
  reservationId: number;
  reservationNo: string;
  guestName: string;
  mobileNo?: string | null;
  email?: string | null;
  arrivalDate: string;
  departureDate: string;
  nights: number;
  roomType: string;
  reservedRoomId?: number | null;
  reservedRoomNo?: string | null;
  adults: number;
  children: number;
  boardBasisId: number;
  boardBasisName: string;
  advancePayment: number;
  totalEstimate: number;
  reservationStatus: ReservationStatus;
  note?: string | null;
  createdAt: string;
};

type RoomRow = {
  roomId: number;
  roomNo: string;
  roomType: string;
  floorName: string;
  defaultRate: number;
  currentStatus: string;
};

type BoardBasisRow = {
  boardBasisId: number;
  boardBasisCode: string;
  boardBasisName: string;
  sortOrder: number;
  isActive: boolean;
};

type ReservationFormState = {
  reservationId?: number;
  reservationNo: string;
  guestName: string;
  mobileNo: string;
  email: string;
  arrivalDate: string;
  departureDate: string;
  roomType: string;
  reservedRoomId: string;
  adults: string;
  children: string;
  boardBasisId: string;
  advancePayment: string;
  totalEstimate: string;
  reservationStatus: ReservationStatus;
  note: string;
};

type MessageTone = "success" | "warning" | "info";

const STATUS_FILTERS: Array<ReservationStatus | "All"> = [
  "All",
  "Tentative",
  "Confirmed",
  "Checked In",
  "Checked Out",
  "Cancelled",
  "No Show",
];

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowIsoDate() {
  return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
}

function emptyForm(): ReservationFormState {
  return {
    reservationNo: "",
    guestName: "",
    mobileNo: "",
    email: "",
    arrivalDate: todayIsoDate(),
    departureDate: tomorrowIsoDate(),
    roomType: "",
    reservedRoomId: "",
    adults: "2",
    children: "0",
    boardBasisId: "1",
    advancePayment: "0",
    totalEstimate: "0",
    reservationStatus: "Confirmed",
    note: "",
  };
}

function toneClasses(tone: MessageTone) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function currency(value: number) {
  return `LKR ${value.toLocaleString()}`;
}

function dateDiffNights(arrivalDate: string, departureDate: string) {
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  const diff = departure.getTime() - arrival.getTime();
  return Math.round(diff / 86400000);
}

function formatStatusTone(status: ReservationStatus) {
  switch (status) {
    case "Confirmed":
      return "bg-sky-100 text-sky-700";
    case "Checked In":
      return "bg-emerald-100 text-emerald-700";
    case "Checked Out":
      return "bg-slate-200 text-slate-700";
    case "Cancelled":
    case "No Show":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-amber-100 text-amber-700";
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

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [boardBasis, setBoardBasis] = useState<BoardBasisRow[]>([]);
  const [activeReservationId, setActiveReservationId] = useState<number | null>(null);
  const [form, setForm] = useState<ReservationFormState>(emptyForm());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "All">("All");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: MessageTone; text: string } | null>({
    tone: "info",
    text: "Reservations are now using live DB-backed room, board basis, create, update, and check-in flows.",
  });

  const availableRooms = useMemo(() => {
    return rooms.filter((room) =>
      room.currentStatus === "Vacant Ready" ||
      room.currentStatus === "Reserved" ||
      String(room.roomId) === form.reservedRoomId
    );
  }, [rooms, form.reservedRoomId]);

  const selectedRoom = useMemo(() => {
    return rooms.find((room) => String(room.roomId) === form.reservedRoomId) ?? null;
  }, [rooms, form.reservedRoomId]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const filterOk = statusFilter === "All" ? true : reservation.reservationStatus === statusFilter;
      const q = search.trim().toLowerCase();

      const searchOk =
        !q ||
        reservation.reservationNo.toLowerCase().includes(q) ||
        reservation.guestName.toLowerCase().includes(q) ||
        (reservation.mobileNo ?? "").toLowerCase().includes(q) ||
        (reservation.reservedRoomNo ?? "").toLowerCase().includes(q);

      return filterOk && searchOk;
    });
  }, [reservations, search, statusFilter]);

  const activeReservation = useMemo(() => {
    return reservations.find((row) => row.reservationId === activeReservationId) ?? null;
  }, [reservations, activeReservationId]);

  const summary = useMemo(() => {
    return {
      tentative: reservations.filter((row) => row.reservationStatus === "Tentative").length,
      confirmed: reservations.filter((row) => row.reservationStatus === "Confirmed").length,
      checkedIn: reservations.filter((row) => row.reservationStatus === "Checked In").length,
      cancelled: reservations.filter((row) =>
        row.reservationStatus === "Cancelled" || row.reservationStatus === "No Show"
      ).length,
    };
  }, [reservations]);

  useEffect(() => {
    void (async () => {
      try {
        const [reservationData, roomData, boardBasisData] = await Promise.all([
          readJson<ReservationRow[]>("/api/reservations"),
          readJson<RoomRow[]>("/api/rooms"),
          readJson<BoardBasisRow[]>("/api/board-basis"),
        ]);

        setReservations(reservationData);
        setRooms(roomData);
        setBoardBasis(boardBasisData);

        if (reservationData.length > 0) {
          setActiveReservationId(reservationData[0].reservationId);
        } else if (boardBasisData[0]) {
          setForm((prev) => ({
            ...prev,
            boardBasisId: String(boardBasisData[0].boardBasisId),
          }));
        }
      } catch (error) {
        console.error("Failed to load reservations page", error);
        setMessage({
          tone: "warning",
          text: error instanceof Error ? error.message : "Failed to load reservation data.",
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!activeReservation) {
      if (boardBasis[0] && !form.reservationId) {
        setForm((prev) => ({
          ...prev,
          boardBasisId: prev.boardBasisId || String(boardBasis[0].boardBasisId),
        }));
      }
      return;
    }

    setForm({
      reservationId: activeReservation.reservationId,
      reservationNo: activeReservation.reservationNo,
      guestName: activeReservation.guestName,
      mobileNo: activeReservation.mobileNo ?? "",
      email: activeReservation.email ?? "",
      arrivalDate: activeReservation.arrivalDate,
      departureDate: activeReservation.departureDate,
      roomType: activeReservation.roomType,
      reservedRoomId: activeReservation.reservedRoomId ? String(activeReservation.reservedRoomId) : "",
      adults: String(activeReservation.adults),
      children: String(activeReservation.children),
      boardBasisId: String(activeReservation.boardBasisId),
      advancePayment: String(activeReservation.advancePayment ?? 0),
      totalEstimate: String(activeReservation.totalEstimate ?? 0),
      reservationStatus: activeReservation.reservationStatus,
      note: activeReservation.note ?? "",
    });
  }, [activeReservation, boardBasis]);

  useEffect(() => {
    const nights = dateDiffNights(form.arrivalDate, form.departureDate);

    if (selectedRoom && Number.isFinite(nights) && nights > 0) {
      const expected = selectedRoom.defaultRate * nights;
      setForm((prev) => {
        const currentTotal = Number(prev.totalEstimate || 0);
        if (!currentTotal || currentTotal === 0) {
          return {
            ...prev,
            roomType: selectedRoom.roomType,
            totalEstimate: String(expected),
          };
        }
        return {
          ...prev,
          roomType: selectedRoom.roomType,
        };
      });
    }
  }, [selectedRoom, form.arrivalDate, form.departureDate]);

  function showMessage(text: string, tone: MessageTone = "success") {
    setMessage({ text, tone });
  }

  async function refreshReservations(preferredReservationId?: number | null) {
    const [reservationData, roomData] = await Promise.all([
      readJson<ReservationRow[]>("/api/reservations"),
      readJson<RoomRow[]>("/api/rooms"),
    ]);

    setReservations(reservationData);
    setRooms(roomData);

    const nextReservationId =
      preferredReservationId ??
      activeReservationId ??
      reservationData[0]?.reservationId ??
      null;

    setActiveReservationId(nextReservationId);
  }

  function startNewReservation() {
    setActiveReservationId(null);
    setForm({
      ...emptyForm(),
      boardBasisId: boardBasis[0] ? String(boardBasis[0].boardBasisId) : "1",
    });
    showMessage("New reservation form is ready.", "info");
  }

  function updateForm<K extends keyof ReservationFormState>(
    key: K,
    value: ReservationFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveReservation(e: React.FormEvent) {
    e.preventDefault();

    const nights = dateDiffNights(form.arrivalDate, form.departureDate);
    if (!Number.isFinite(nights) || nights <= 0) {
      showMessage("Departure date must be after arrival date.", "warning");
      return;
    }

    if (!form.guestName.trim()) {
      showMessage("Guest name is required.", "warning");
      return;
    }

    if (!form.boardBasisId) {
      showMessage("Select a board basis.", "warning");
      return;
    }

    setBusy(true);

    try {
      const payload = {
        guestName: form.guestName.trim(),
        mobileNo: form.mobileNo.trim() || null,
        email: form.email.trim() || null,
        arrivalDate: form.arrivalDate,
        departureDate: form.departureDate,
        roomType: form.roomType || selectedRoom?.roomType || "Standard",
        reservedRoomId: form.reservedRoomId ? Number(form.reservedRoomId) : null,
        adults: Number(form.adults || 1),
        children: Number(form.children || 0),
        boardBasisId: Number(form.boardBasisId),
        advancePayment: Number(form.advancePayment || 0),
        totalEstimate: Number(form.totalEstimate || 0),
        reservationStatus: form.reservationStatus,
        note: form.note || null,
      };

      const saved = form.reservationId
        ? await readJson<ReservationRow>(`/api/reservations/${form.reservationId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await readJson<ReservationRow>("/api/reservations", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      await refreshReservations(saved.reservationId);
      showMessage(
        form.reservationId
          ? `Reservation ${saved.reservationNo} updated.`
          : `Reservation ${saved.reservationNo} created.`,
        "success"
      );
    } catch (error) {
      console.error("Failed to save reservation", error);
      showMessage(
        error instanceof Error ? error.message : "Failed to save reservation.",
        "warning"
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckIn() {
    if (!form.reservationId) {
      showMessage("Save the reservation before check-in.", "warning");
      return;
    }

    if (!form.reservedRoomId) {
      showMessage("Assign a room before check-in.", "warning");
      return;
    }

    setBusy(true);

    try {
      await readJson(`/api/reservations/${form.reservationId}/check-in`, {
        method: "POST",
      });

      await refreshReservations(form.reservationId);
      showMessage(
        `Reservation ${form.reservationNo || form.reservationId} checked in successfully.`,
        "success"
      );
    } catch (error) {
      console.error("Failed to check in reservation", error);
      showMessage(
        error instanceof Error ? error.message : "Failed to check in reservation.",
        "warning"
      );
    } finally {
      setBusy(false);
    }
  }

  const nights = dateDiffNights(form.arrivalDate, form.departureDate);

  return (
    <AppShell
      title="Reservations"
      description="DB-bound reservation creation, update, room assignment, and check-in handoff."
    >
      {message ? (
        <div className={`mb-6 rounded-3xl border px-4 py-3 text-sm ${toneClasses(message.tone)}`}>
          {message.text}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Tentative",
            value: String(summary.tentative),
            helper: "Pending conversion or confirmation",
            icon: ClipboardList,
          },
          {
            label: "Confirmed",
            value: String(summary.confirmed),
            helper: "Ready for arrival planning",
            icon: CalendarRange,
          },
          {
            label: "Checked In",
            value: String(summary.checkedIn),
            helper: "Already handed into Front Office",
            icon: Hotel,
          },
          {
            label: "Cancelled / No Show",
            value: String(summary.cancelled),
            helper: "Closed booking requests",
            icon: BedDouble,
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

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.3fr]">
        <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardContent className="p-5">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[260px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by reservation no, guest, mobile, room"
                  className="h-11 rounded-2xl border-slate-200 bg-white pl-9"
                />
              </div>

              <Button
                onClick={startNewReservation}
                className="h-11 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
              >
                New Reservation
              </Button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
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
              {filteredReservations.map((reservation) => {
                const isActive = reservation.reservationId === activeReservationId;
                return (
                  <button
                    key={reservation.reservationId}
                    type="button"
                    onClick={() => setActiveReservationId(reservation.reservationId)}
                    className={`w-full rounded-[24px] border p-4 text-left transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold">{reservation.reservationNo}</p>
                        <p className={`mt-1 text-sm ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                          {reservation.guestName}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isActive ? "bg-white/10 text-white" : formatStatusTone(reservation.reservationStatus)
                        }`}
                      >
                        {reservation.reservationStatus}
                      </span>
                    </div>

                    <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${isActive ? "text-slate-200" : "text-slate-600"}`}>
                      <div>
                        <p className="text-xs uppercase tracking-wide opacity-70">Stay</p>
                        <p className="mt-1 text-sm">
                          {reservation.arrivalDate} → {reservation.departureDate}
                        </p>
                        <p className="text-xs opacity-70">{reservation.nights} nights</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide opacity-70">Room / Board</p>
                        <p className="mt-1 text-sm">
                          {reservation.reservedRoomNo ? `Room ${reservation.reservedRoomNo}` : "Not assigned"}
                        </p>
                        <p className="text-xs opacity-70">{reservation.boardBasisName}</p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredReservations.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  No reservations found for the selected filter.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xl font-semibold text-slate-900">
                    {form.reservationId ? form.reservationNo : "New Reservation"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    DB-bound reservation form with room assignment and live check-in handoff.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-100">
                    {form.reservationStatus}
                  </Badge>
                  {selectedRoom ? (
                    <Badge className="rounded-full bg-sky-100 px-3 py-1.5 text-sky-700 hover:bg-sky-100">
                      Room {selectedRoom.roomNo}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Dates</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    {form.arrivalDate} → {form.departureDate}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {Number.isFinite(nights) && nights > 0 ? `${nights} nights` : "Select valid dates"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Guests</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Users className="h-4 w-4 text-slate-500" />
                    {form.adults} adults / {form.children} children
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{form.guestName || "Guest name pending"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Board Basis</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {boardBasis.find((row) => String(row.boardBasisId) === form.boardBasisId)?.boardBasisName ?? "Select"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Hotel board-basis master</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Estimate</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{currency(Number(form.totalEstimate || 0))}</p>
                  <p className="mt-1 text-xs text-slate-500">Advance {currency(Number(form.advancePayment || 0))}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
            <CardContent className="p-5">
              <form className="space-y-5" onSubmit={handleSaveReservation}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Guest Name</label>
                    <Input
                      value={form.guestName}
                      onChange={(e) => updateForm("guestName", e.target.value)}
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Mobile No</label>
                    <Input
                      value={form.mobileNo}
                      onChange={(e) => updateForm("mobileNo", e.target.value)}
                      className="h-11 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <Input
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Reservation Status</label>
                    <select
                      value={form.reservationStatus}
                      onChange={(e) => updateForm("reservationStatus", e.target.value as ReservationStatus)}
                      className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                    >
                      {STATUS_FILTERS.filter((item) => item !== "All").map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Arrival Date</label>
                    <Input
                      type="date"
                      value={form.arrivalDate}
                      onChange={(e) => updateForm("arrivalDate", e.target.value)}
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Departure Date</label>
                    <Input
                      type="date"
                      value={form.departureDate}
                      onChange={(e) => updateForm("departureDate", e.target.value)}
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Adults</label>
                    <Input
                      type="number"
                      min="1"
                      value={form.adults}
                      onChange={(e) => updateForm("adults", e.target.value)}
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Children</label>
                    <Input
                      type="number"
                      min="0"
                      value={form.children}
                      onChange={(e) => updateForm("children", e.target.value)}
                      className="h-11 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Assigned Room</label>
                    <select
                      value={form.reservedRoomId}
                      onChange={(e) => updateForm("reservedRoomId", e.target.value)}
                      className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                    >
                      <option value="">Select room</option>
                      {availableRooms.map((room) => (
                        <option key={room.roomId} value={String(room.roomId)}>
                          Room {room.roomNo} • {room.roomType} • {room.currentStatus}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Room Type</label>
                    <Input
                      value={form.roomType}
                      onChange={(e) => updateForm("roomType", e.target.value)}
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Board Basis</label>
                    <select
                      value={form.boardBasisId}
                      onChange={(e) => updateForm("boardBasisId", e.target.value)}
                      className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                    >
                      {boardBasis.map((row) => (
                        <option key={row.boardBasisId} value={String(row.boardBasisId)}>
                          {row.boardBasisName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nights</label>
                    <Input
                      value={Number.isFinite(nights) && nights > 0 ? String(nights) : "0"}
                      readOnly
                      className="h-11 rounded-2xl bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Advance Payment</label>
                    <Input
                      type="number"
                      min="0"
                      value={form.advancePayment}
                      onChange={(e) => updateForm("advancePayment", e.target.value)}
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Total Estimate</label>
                    <Input
                      type="number"
                      min="0"
                      value={form.totalEstimate}
                      onChange={(e) => updateForm("totalEstimate", e.target.value)}
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    {selectedRoom ? (
                      <>
                        <p className="font-medium text-slate-900">Selected Room {selectedRoom.roomNo}</p>
                        <p className="mt-1">{selectedRoom.roomType}</p>
                        <p className="text-xs text-slate-500">
                          Default rate {currency(Number(selectedRoom.defaultRate ?? 0))}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-slate-900">No Room Selected</p>
                        <p className="mt-1 text-xs text-slate-500">Assign a room to prepare for check-in.</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Notes</label>
                  <textarea
                    value={form.note}
                    onChange={(e) => updateForm("note", e.target.value)}
                    className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    className="h-11 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                    disabled={busy}
                  >
                    Save Reservation
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-2xl border-slate-300 bg-white"
                    onClick={startNewReservation}
                    disabled={busy}
                  >
                    Reset to New
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-2xl border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    onClick={handleCheckIn}
                    disabled={
                      busy ||
                      !form.reservationId ||
                      !form.reservedRoomId ||
                      form.reservationStatus === "Checked In" ||
                      form.reservationStatus === "Checked Out" ||
                      form.reservationStatus === "Cancelled" ||
                      form.reservationStatus === "No Show"
                    }
                  >
                    Check In to Front Office
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
