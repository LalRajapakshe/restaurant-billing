"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  CalendarClock,
  CalendarDays,
  Hotel,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";

import CheckoutPanel from "@/components/front-office/checkout-panel";
import RoomAllocationForm from "@/components/front-office/room-allocation-form";
import RoomFolioPanel from "@/components/front-office/room-folio-panel";
import RoomList from "@/components/front-office/room-list";
import RoomStatusBadge from "@/components/front-office/room-status-badge";
import AppShell from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import {
  FolioEntry,
  FolioEntryType,
  FolioPaymentMethod,
  FolioSourceModule,
} from "@/types/folio";
import { BoardBasis, RoomPayload, RoomRecord, RoomStatus } from "@/types/room";

type ApiMode = "loading" | "connected" | "error";
type MessageTone = "success" | "warning" | "info";
type WorkTab = "stay" | "folio" | "checkout";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type RoomListApiRow = {
  roomId: number;
  roomNo: string;
  roomType: string;
  floorName: string;
  defaultRate: number;
  currentStatus: RoomStatus;
  notes?: string | null;
  housekeepingNote?: string | null;
  stayId?: number | null;
  reservationId?: number | null;
  guestName?: string | null;
  mobileNo?: string | null;
  checkInDate?: string | null;
  expectedCheckOutDate?: string | null;
  nights?: number | null;
  adults?: number | null;
  children?: number | null;
  boardBasisId?: number | null;
  boardBasisName?: string | null;
  roomRate?: number | null;
  stayStatus?: string | null;
};

type RoomDetailApiRow = {
  roomId: number;
  roomNo: string;
  roomType: string;
  floorName: string;
  defaultRate: number;
  currentStatus: RoomStatus;
  notes?: string | null;
  housekeepingNote?: string | null;
  stayId?: number | null;
  stayNo?: string | null;
  reservationId?: number | null;
  guestName?: string | null;
  mobileNo?: string | null;
  checkInDate?: string | null;
  expectedCheckOutDate?: string | null;
  actualCheckOutDate?: string | null;
  nights?: number | null;
  adults?: number | null;
  children?: number | null;
  boardBasisId?: number | null;
  boardBasisName?: string | null;
  roomRate?: number | null;
  stayStatus?: string | null;
  stayNote?: string | null;
};

type FolioEntryApiRow = {
  folioEntryId: number;
  stayId: number;
  roomId: number;
  entryType: "charge" | "payment" | "adjustment";
  sourceModule: "room" | "restaurant" | "frontoffice" | "housekeeping";
  sourceDocType: string;
  sourceDocId?: string | null;
  description: string;
  debitAmount: number;
  creditAmount: number;
  postingDate: string;
  paymentMethod?: FolioPaymentMethod | null;
  note?: string | null;
};

type FolioSummaryApi = {
  roomId: number;
  roomNo: string;
  stayId: number;
  stayNo: string;
  guestName: string;
  chargesTotal: number;
  paymentsTotal: number;
  balance: number;
  entries: FolioEntryApiRow[];
} | null;

const BOARD_BASIS_ID_BY_NAME: Record<string, number> = {
  "Room Only": 1,
  "Bed & Breakfast": 2,
  "Half Board": 3,
  "Full Board": 4,
  "All Inclusive": 5,
};

function currency(value: number) {
  return `LKR ${value.toLocaleString()}`;
}

function toneClasses(tone: MessageTone) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowIsoDate() {
  return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
}


function normalizeBoardBasis(value?: string | null): BoardBasis {
  switch (value) {
    case "Room Only":
      return "Room Only";
    case "Half Board":
      return "Half Board";
    case "Full Board":
      return "Full Board";
    case "Bed & Breakfast":
      return "Room Only";
    default:
      return "Room Only";
  }
}

function mapRoomRowToUi(row: RoomListApiRow | RoomDetailApiRow): RoomRecord {
  return {
    id: String(row.roomId),
    roomNo: row.roomNo,
    roomType: row.roomType,
    floor: row.floorName,
    rate: Number(row.roomRate ?? row.defaultRate ?? 0),
    status: row.currentStatus,
    reservationId: row.reservationId ? String(row.reservationId) : "",
    guestName: row.guestName ?? "",
    mobile: row.mobileNo ?? "",
    arrivalDate: row.checkInDate ?? "",
    departureDate: row.expectedCheckOutDate ?? "",
    nights: Number(row.nights ?? 0),
    adults: Number(row.adults ?? 0),
    children: Number(row.children ?? 0),
    boardBasis: normalizeBoardBasis(row.boardBasisName),
    notes: "stayNote" in row ? row.stayNote ?? row.notes ?? "" : row.notes ?? "",
    housekeepingNote: row.housekeepingNote ?? "",
    lastCleanedBy: "",
  };
}


function normalizeFolioSourceModule(
  value: "room" | "restaurant" | "frontoffice" | "housekeeping"
): FolioSourceModule {
  switch (value) {
    case "room":
      return "room";
    case "restaurant":
      return "restaurant";
    case "frontoffice":
      return "frontoffice";
    case "housekeeping":
      return "room";
    default:
      return "room";
  }
}


function normalizeFolioEntryType(
  value: "charge" | "payment" | "adjustment"
): FolioEntryType {
  switch (value) {
    case "charge":
      return "charge";
    case "payment":
      return "payment";
    case "adjustment":
      return "charge";
    default:
      return "charge";
  }
}

function mapFolioEntry(entry: FolioEntryApiRow): FolioEntry {
  return {
    id: String(entry.folioEntryId),
    roomId: String(entry.roomId),
    roomNo: "",
    guestName: "",
    reservationId: "",
    sourceModule: normalizeFolioSourceModule(entry.sourceModule),
    description: entry.description,
    entryType: normalizeFolioEntryType(entry.entryType),
    debit: Number(entry.debitAmount ?? 0),
    credit: Number(entry.creditAmount ?? 0),
    postedAt: entry.postingDate,
    paymentMethod: entry.paymentMethod ?? null,
    note: entry.note ?? undefined,
  };
}

function createEmptyRoomForm(room?: RoomRecord | null): RoomPayload {
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
    arrivalDate: room?.arrivalDate || todayIsoDate(),
    departureDate: room?.departureDate || tomorrowIsoDate(),
    adults: room?.adults && room.adults > 0 ? room.adults : 2,
    children: room?.children ?? 0,
    boardBasis: room?.boardBasis ?? "Room Only",
    notes: room?.notes ?? "",
    housekeepingNote: room?.housekeepingNote ?? "",
    lastCleanedBy: room?.lastCleanedBy ?? "",
  };
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

export default function FrontOfficePage() {
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [selectedRoomDbId, setSelectedRoomDbId] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomRecord | null>(null);
  const [selectedStayId, setSelectedStayId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<RoomStatus | "All">("All");
  const [apiMode, setApiMode] = useState<ApiMode>("loading");
  const [formMode, setFormMode] = useState<"allocate" | "update">("allocate");
  const [workTab, setWorkTab] = useState<WorkTab>("stay");
  const [form, setForm] = useState<RoomPayload>(createEmptyRoomForm(null));
  const [folioEntries, setFolioEntries] = useState<FolioEntry[]>([]);
  const [folioBalance, setFolioBalance] = useState(0);
  const [folioEntryCount, setFolioEntryCount] = useState(0);
  const [folioPaymentForm, setFolioPaymentForm] = useState<{
    amount: string;
    method: Exclude<FolioPaymentMethod, "System">;
  }>({
    amount: "",
    method: "Cash",
  });
  const [message, setMessage] = useState<{ tone: MessageTone; text: string } | null>({
    tone: "info",
    text: "Front Office is now loading room, stay, folio, payment, and checkout data from the DB-backed API.",
  });
  const [busy, setBusy] = useState(false);

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

  async function loadRooms(preferredRoomId?: number | null) {
    const data = await readJson<RoomListApiRow[]>("/api/rooms");
    const mapped = data.map(mapRoomRowToUi);
    setRooms(mapped);
    const nextSelected = preferredRoomId ?? selectedRoomDbId ?? (data[0]?.roomId ?? null);
    setSelectedRoomDbId(nextSelected);
    setApiMode("connected");
  }

  async function loadSelectedRoom(roomId: number) {
    const data = await readJson<RoomDetailApiRow>(`/api/rooms/${roomId}`);
    const mapped = mapRoomRowToUi(data);
    setSelectedRoom(mapped);
    setSelectedStayId(data.stayId ?? null);
    setForm(createEmptyRoomForm(mapped));
    setFormMode(data.stayId ? "update" : "allocate");
  }

  async function loadFolio(roomId: number) {
    try {
      const data = await readJson<FolioSummaryApi>(`/api/folios/by-room/${roomId}`);
      if (!data) {
        setFolioEntries([]);
        setFolioBalance(0);
        setFolioEntryCount(0);
        return;
      }
      const mappedEntries = (data.entries ?? []).map(mapFolioEntry);
      setFolioEntries(mappedEntries);
      setFolioBalance(Number(data.balance ?? 0));
      setFolioEntryCount(mappedEntries.length);
      setSelectedStayId(data.stayId ?? null);
    } catch {
      setFolioEntries([]);
      setFolioBalance(0);
      setFolioEntryCount(0);
    }
  }

  async function refreshRoomContext(roomId?: number | null) {
    const targetRoomId = roomId ?? selectedRoomDbId;
    if (!targetRoomId) return;
    await loadRooms(targetRoomId);
    await loadSelectedRoom(targetRoomId);
    await loadFolio(targetRoomId);
  }

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        await loadRooms();
      } catch (error) {
        console.error("Front Office init load failed", error);
        if (mounted) {
          setApiMode("error");
          showMessage("Failed to load room data from DB API.", "warning");
        }
      }
    }
    void init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedRoomDbId) {
      setSelectedRoom(null);
      setSelectedStayId(null);
      setFolioEntries([]);
      setFolioBalance(0);
      setFolioEntryCount(0);
      return;
    }

    void (async () => {
      try {
        await loadSelectedRoom(selectedRoomDbId);
        await loadFolio(selectedRoomDbId);
      } catch (error) {
        console.error("Failed to load selected room context", error);
        showMessage("Failed to load selected room details.", "warning");
      }
    })();
  }, [selectedRoomDbId]);

  function updateForm<K extends keyof RoomPayload>(field: K, value: RoomPayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm(createEmptyRoomForm(selectedRoom));
    setFormMode(selectedStayId ? "update" : "allocate");
  }

  async function handleStaySubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedRoomDbId || !selectedRoom) {
      showMessage("Select a room first.", "warning");
      return;
    }

    const boardBasisId = BOARD_BASIS_ID_BY_NAME[form.boardBasis ?? "Room Only"];
    if (!boardBasisId) {
      showMessage("Board basis mapping is not available.", "warning");
      return;
    }

    setBusy(true);

    try {
      if (selectedStayId) {
        await readJson(`/api/stays/${selectedStayId}`, {
          method: "PUT",
          body: JSON.stringify({
            guestName: form.guestName,
            mobileNo: form.mobile,
            expectedCheckOutDate: form.departureDate,
            adults: Number(form.adults ?? 1),
            children: Number(form.children ?? 0),
            boardBasisId,
            roomRate: Number(form.rate ?? 0),
            note: form.notes ?? "",
            updatedByUserId: null,
          }),
        });
        showMessage(`Stay updated for Room ${selectedRoom.roomNo}.`, "success");
      } else {
        await readJson(`/api/stays`, {
          method: "POST",
          body: JSON.stringify({
            roomId: selectedRoomDbId,
            guestName: form.guestName,
            mobileNo: form.mobile,
            checkInDate: form.arrivalDate,
            expectedCheckOutDate: form.departureDate,
            adults: Number(form.adults ?? 1),
            children: Number(form.children ?? 0),
            boardBasisId,
            roomRate: Number(form.rate ?? 0),
            note: form.notes ?? "",
            reservationId: form.reservationId ? Number(form.reservationId) || null : null,
            createdByUserId: null,
          }),
        });
        showMessage(`Stay created for Room ${selectedRoom.roomNo}.`, "success");
      }

      await refreshRoomContext(selectedRoomDbId);
      setWorkTab("folio");
    } catch (error) {
      console.error("Failed to save stay", error);
      showMessage(error instanceof Error ? error.message : "Failed to save stay.", "warning");
    } finally {
      setBusy(false);
    }
  }

  async function handleApplyPayment() {
    if (!selectedRoomDbId || !selectedStayId || !selectedRoom) {
      showMessage("No active stay is selected for payment.", "warning");
      return;
    }

    const amount = Number(folioPaymentForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showMessage("Enter a valid payment amount.", "warning");
      return;
    }

    setBusy(true);

    try {
      await readJson(`/api/folios/payments`, {
        method: "POST",
        body: JSON.stringify({
          stayId: selectedStayId,
          roomId: selectedRoomDbId,
          amount,
          paymentMethod: folioPaymentForm.method,
          referenceNo: null,
          note: "Front Office payment entry",
          createdByUserId: null,
        }),
      });

      setFolioPaymentForm({ amount: "", method: "Cash" });
      showMessage(`Payment saved for Room ${selectedRoom.roomNo}.`, "success");
      await refreshRoomContext(selectedRoomDbId);
    } catch (error) {
      console.error("Failed to apply payment", error);
      showMessage(error instanceof Error ? error.message : "Failed to apply payment.", "warning");
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckout() {
    if (!selectedStayId || !selectedRoomDbId || !selectedRoom) {
      showMessage("No checked-in stay is selected for checkout.", "warning");
      return;
    }

    setBusy(true);

    try {
      await readJson(`/api/stays/${selectedStayId}/checkout`, {
        method: "POST",
        body: JSON.stringify({
          completedByUserId: null,
          note: "Checkout completed from Front Office screen.",
        }),
      });

      showMessage(
        `Checkout completed for Room ${selectedRoom.roomNo}. Housekeeping task generated.`,
        "success"
      );

      await refreshRoomContext(selectedRoomDbId);
      setWorkTab("stay");
    } catch (error) {
      console.error("Failed to complete checkout", error);
      showMessage(error instanceof Error ? error.message : "Failed to complete checkout.", "warning");
    } finally {
      setBusy(false);
    }
  }

  const summaryCards = [
    { label: "Vacant Ready", value: String(vacantReadyCount), helper: "Available for immediate allocation", icon: Hotel },
    { label: "Reserved", value: String(reservedCount), helper: "Expected arrivals waiting for check-in", icon: CalendarClock },
    { label: "Occupied", value: String(occupiedCount), helper: "Current in-house rooms", icon: BedDouble },
    { label: "Dirty", value: String(dirtyCount), helper: "Ready for housekeeping turnover", icon: Sparkles },
  ];

  return (
    <AppShell
      title="Front Office / Room Utilization"
      description="DB-bound Front Office screen with live room list, room detail, folio, stay update, payment, and checkout refresh."
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
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{card.value}</p>
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

      <div className="grid min-h-[calc(100vh-18rem)] gap-6 xl:grid-cols-[1.15fr_1.35fr]">
        <div className="min-h-0">
          <RoomList
            rooms={filteredRooms}
            activeRoomId={selectedRoomDbId ? String(selectedRoomDbId) : null}
            search={search}
            onSearchChange={setSearch}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onSelectRoom={(roomId) => {
              const parsed = Number(roomId);
              setSelectedRoomDbId(Number.isFinite(parsed) ? parsed : null);
            }}
          />
        </div>

        <div className="min-h-0 space-y-6 overflow-y-auto pr-1">
          <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
            <CardContent className="p-5">
              {selectedRoom ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <RoomStatusBadge status={selectedRoom.status} />
                        <span className="text-xs text-slate-500">DB Room {selectedRoom.id}</span>
                      </div>
                      <p className="mt-3 text-xl font-semibold text-slate-900">Room {selectedRoom.roomNo}</p>
                      <p className="text-sm text-slate-500">{selectedRoom.roomType} • {selectedRoom.floor}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(["stay", "folio", "checkout"] as WorkTab[]).map((tab) => (
                        <button
                          key={tab}
                          className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                            workTab === tab
                              ? "bg-slate-900 text-white"
                              : "border border-slate-200 bg-white text-slate-900"
                          }`}
                          onClick={() => setWorkTab(tab)}
                          type="button"
                        >
                          {tab === "stay" ? "Stay" : tab === "folio" ? "Folio" : "Checkout"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Guest</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{selectedRoom.guestName || "Vacant"}</p>
                      <p className="mt-1 text-xs text-slate-500">{selectedRoom.reservationId || "No reservation ref"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Stay Dates</p>
                      <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                        <CalendarDays className="h-4 w-4 text-slate-500" />
                        {selectedRoom.arrivalDate
                          ? `${selectedRoom.arrivalDate} → ${selectedRoom.departureDate}`
                          : "No active stay"}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {selectedRoom.nights > 0 ? `${selectedRoom.nights} nights` : "No stay"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Occupancy</p>
                      <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                        <Users className="h-4 w-4 text-slate-500" />
                        {selectedRoom.adults} adults / {selectedRoom.children} children
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{selectedRoom.boardBasis}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Contact / Rate</p>
                      <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                        <Phone className="h-4 w-4 text-slate-500" />
                        {selectedRoom.mobile || "No mobile"}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{currency(selectedRoom.rate)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  No room selected.
                </div>
              )}
            </CardContent>
          </Card>

          {workTab === "stay" ? (
            <RoomAllocationForm
              selectedRoomNo={selectedRoom?.roomNo ?? ""}
              selectedRoomType={selectedRoom?.roomType ?? ""}
              mode={formMode}
              form={form}
              onChange={updateForm}
              onSubmit={handleStaySubmit}
              onReset={resetForm}
            />
          ) : null}

          {workTab === "folio" ? (
            <RoomFolioPanel
              room={selectedRoom}
              entries={folioEntries}
              currency={currency}
              paymentForm={folioPaymentForm}
              onPaymentFormChange={(field, value) =>
                setFolioPaymentForm((prev) => ({ ...prev, [field]: value }))
              }
              onApplyPayment={handleApplyPayment}
              onOpenCheckout={() => setWorkTab("checkout")}
            />
          ) : null}

          {workTab === "checkout" ? (
            <CheckoutPanel
              room={selectedRoom}
              currency={currency}
              folioBalance={folioBalance}
              folioEntryCount={folioEntryCount}
              onCheckout={handleCheckout}
              onOpenFolio={() => setWorkTab("folio")}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white/90 p-4 text-xs text-slate-500 shadow-sm">
        API mode: <span className="font-medium text-slate-700">{apiMode}</span>.{" "}
        {busy ? "Processing action..." : "Room, stay, folio, payment, and checkout now refresh from DB endpoints."}
      </div>
    </AppShell>
  );
}
