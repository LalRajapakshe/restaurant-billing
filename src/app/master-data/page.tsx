"use client";

import { useEffect, useMemo, useState } from "react";
import { BedDouble, Database, Hotel, Layers3, ListChecks, Store } from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type TabKey =
  | "board-basis"
  | "outlets"
  | "restaurant-tables"
  | "payment-methods"
  | "room-types"
  | "rooms";

type MessageTone = "success" | "warning" | "info";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type BoardBasisRow = {
  boardBasisId: number;
  boardBasisCode: string;
  boardBasisName: string;
  sortOrder: number;
  isActive: boolean;
};

type OutletRow = {
  outletId: number;
  outletCode: string;
  outletName: string;
  locationId?: number | null;
  sortOrder: number;
  isActive: boolean;
  note?: string | null;
};

type RestaurantTableRow = {
  restaurantTableId: number;
  outletId: number;
  outletName: string;
  tableCode: string;
  tableName: string;
  seatCount: number;
  sortOrder: number;
  isActive: boolean;
  note?: string | null;
};

type PaymentMethodRow = {
  paymentMethodId: number;
  paymentMethodCode: string;
  paymentMethodName: string;
  sortOrder: number;
  isActive: boolean;
  note?: string | null;
};

type RoomTypeRow = {
  roomTypeId: number;
  roomTypeCode: string;
  roomTypeName: string;
  standardRate: number;
  sortOrder: number;
  isActive: boolean;
  note?: string | null;
};

type RoomRow = {
  roomId: number;
  roomNo: string;
  roomTypeId?: number | null;
  roomTypeCode?: string | null;
  roomTypeName: string;
  floorName: string;
  defaultRate: number;
  currentStatus: string;
  isActive: boolean;
  note?: string | null;
};

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

function toneClasses(tone: MessageTone) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardContent className="p-5">
        <div className="mb-5">
          <p className="text-lg font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

const ROOM_STATUS_OPTIONS = [
  "Vacant Ready",
  "Reserved",
  "Occupied",
  "Dirty",
  "Cleaning In Progress",
  "Out of Order",
] as const;

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("room-types");
  const [message, setMessage] = useState<{ tone: MessageTone; text: string } | null>({
    tone: "info",
    text: "Master Data Package 2 is now DB-backed for room types and rooms.",
  });

  const [boardBasis, setBoardBasis] = useState<BoardBasisRow[]>([]);
  const [outlets, setOutlets] = useState<OutletRow[]>([]);
  const [restaurantTables, setRestaurantTables] = useState<RestaurantTableRow[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRow[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeRow[]>([]);
  const [rooms, setRooms] = useState<RoomRow[]>([]);

  const [boardBasisForm, setBoardBasisForm] = useState({
    boardBasisId: "",
    boardBasisCode: "",
    boardBasisName: "",
    sortOrder: "1",
    isActive: true,
  });

  const [outletForm, setOutletForm] = useState({
    outletId: "",
    outletCode: "",
    outletName: "",
    locationId: "1",
    sortOrder: "1",
    isActive: true,
    note: "",
  });

  const [tableForm, setTableForm] = useState({
    restaurantTableId: "",
    outletId: "",
    tableCode: "",
    tableName: "",
    seatCount: "4",
    sortOrder: "1",
    isActive: true,
    note: "",
  });

  const [paymentMethodForm, setPaymentMethodForm] = useState({
    paymentMethodId: "",
    paymentMethodCode: "",
    paymentMethodName: "",
    sortOrder: "1",
    isActive: true,
    note: "",
  });

  const [roomTypeForm, setRoomTypeForm] = useState({
    roomTypeId: "",
    roomTypeCode: "",
    roomTypeName: "",
    standardRate: "0",
    sortOrder: "1",
    isActive: true,
    note: "",
  });

  const [roomForm, setRoomForm] = useState({
    roomId: "",
    roomNo: "",
    roomTypeId: "",
    floorName: "",
    defaultRate: "0",
    currentStatus: "Vacant Ready",
    isActive: true,
    note: "",
  });

  const summaryCards = useMemo(
    () => [
      { label: "Board Basis", value: String(boardBasis.length), icon: Layers3 },
      { label: "Outlets", value: String(outlets.length), icon: Store },
      { label: "Tables", value: String(restaurantTables.length), icon: ListChecks },
      { label: "Payment Methods", value: String(paymentMethods.length), icon: Database },
      { label: "Room Types", value: String(roomTypes.length), icon: BedDouble },
      { label: "Rooms", value: String(rooms.length), icon: Hotel },
    ],
    [
      boardBasis.length,
      outlets.length,
      restaurantTables.length,
      paymentMethods.length,
      roomTypes.length, rooms.length,
    ]
  );

  async function loadAll() {
    const [bb, ol, rt, pm, roomTypeRows, roomRows] = await Promise.all([
      readJson<BoardBasisRow[]>("/api/master-data/board-basis"),
      readJson<OutletRow[]>("/api/master-data/outlets"),
      readJson<RestaurantTableRow[]>("/api/master-data/restaurant-tables"),
      readJson<PaymentMethodRow[]>("/api/master-data/payment-methods"),
      readJson<RoomTypeRow[]>("/api/master-data/room-types"),
      readJson<RoomRow[]>("/api/master-data/rooms"),
    ]);

    setBoardBasis(bb);
    setOutlets(ol);
    setRestaurantTables(rt);
    setPaymentMethods(pm);
    setRoomTypes(roomTypeRows);
    setRooms(roomRows);

    if (!tableForm.outletId && ol[0]) {
      setTableForm((prev) => ({ ...prev, outletId: String(ol[0].outletId) }));
    }
    if (!roomForm.roomTypeId && roomTypeRows[0]) {
      setRoomForm((prev) => ({ ...prev, roomTypeId: String(roomTypeRows[0].roomTypeId) }));
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        await loadAll();
      } catch (error) {
        console.error("Failed to load master data", error);
        setMessage({
          tone: "warning",
          text: error instanceof Error ? error.message : "Failed to load master data.",
        });
      }
    })();
  }, []);

  function showMessage(text: string, tone: MessageTone = "success") {
    setMessage({ text, tone });
  }

  function resetBoardBasisForm() {
    setBoardBasisForm({
      boardBasisId: "",
      boardBasisCode: "",
      boardBasisName: "",
      sortOrder: "1",
      isActive: true,
    });
  }

  function resetOutletForm() {
    setOutletForm({
      outletId: "",
      outletCode: "",
      outletName: "",
      locationId: "1",
      sortOrder: "1",
      isActive: true,
      note: "",
    });
  }

  function resetTableForm() {
    setTableForm({
      restaurantTableId: "",
      outletId: outlets[0] ? String(outlets[0].outletId) : "",
      tableCode: "",
      tableName: "",
      seatCount: "4",
      sortOrder: "1",
      isActive: true,
      note: "",
    });
  }

  function resetPaymentMethodForm() {
    setPaymentMethodForm({
      paymentMethodId: "",
      paymentMethodCode: "",
      paymentMethodName: "",
      sortOrder: "1",
      isActive: true,
      note: "",
    });
  }

  function resetRoomTypeForm() {
    setRoomTypeForm({ roomTypeId: "", roomTypeCode: "", roomTypeName: "", standardRate: "0", sortOrder: "1", isActive: true, note: "", });
  }

  function resetRoomForm() {
    setRoomForm({ roomId: "", roomNo: "", roomTypeId: roomTypes[0] ? String(roomTypes[0].roomTypeId) : "", floorName: "", defaultRate: "0", currentStatus: "Vacant Ready", isActive: true, note: "", });
  }

  async function saveBoardBasis(e: React.FormEvent) {
    e.preventDefault();
    try {
      await readJson(
        boardBasisForm.boardBasisId
          ? `/api/master-data/board-basis/${boardBasisForm.boardBasisId}`
          : "/api/master-data/board-basis",
        {
          method: boardBasisForm.boardBasisId ? "PUT" : "POST",
          body: JSON.stringify({
            boardBasisCode: boardBasisForm.boardBasisCode,
            boardBasisName: boardBasisForm.boardBasisName,
            sortOrder: Number(boardBasisForm.sortOrder || 1),
            isActive: boardBasisForm.isActive,
          }),
        }
      );
      await loadAll();
      resetBoardBasisForm();
      showMessage("Board basis saved.");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to save board basis.", "warning");
    }
  }

  async function saveOutlet(e: React.FormEvent) {
    e.preventDefault();
    try {
      await readJson(
        outletForm.outletId
          ? `/api/master-data/outlets/${outletForm.outletId}`
          : "/api/master-data/outlets",
        {
          method: outletForm.outletId ? "PUT" : "POST",
          body: JSON.stringify({
            outletCode: outletForm.outletCode,
            outletName: outletForm.outletName,
            locationId: outletForm.locationId ? Number(outletForm.locationId) : null,
            sortOrder: Number(outletForm.sortOrder || 1),
            isActive: outletForm.isActive,
            note: outletForm.note || null,
          }),
        }
      );
      await loadAll();
      resetOutletForm();
      showMessage("Outlet saved.");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to save outlet.", "warning");
    }
  }

  async function saveRestaurantTable(e: React.FormEvent) {
    e.preventDefault();
    try {
      await readJson(
        tableForm.restaurantTableId
          ? `/api/master-data/restaurant-tables/${tableForm.restaurantTableId}`
          : "/api/master-data/restaurant-tables",
        {
          method: tableForm.restaurantTableId ? "PUT" : "POST",
          body: JSON.stringify({
            outletId: Number(tableForm.outletId),
            tableCode: tableForm.tableCode,
            tableName: tableForm.tableName,
            seatCount: Number(tableForm.seatCount || 0),
            sortOrder: Number(tableForm.sortOrder || 1),
            isActive: tableForm.isActive,
            note: tableForm.note || null,
          }),
        }
      );
      await loadAll();
      resetTableForm();
      showMessage("Restaurant table saved.");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to save restaurant table.", "warning");
    }
  }

  async function savePaymentMethod(e: React.FormEvent) {
    e.preventDefault();
    try {
      await readJson(
        paymentMethodForm.paymentMethodId
          ? `/api/master-data/payment-methods/${paymentMethodForm.paymentMethodId}`
          : "/api/master-data/payment-methods",
        {
          method: paymentMethodForm.paymentMethodId ? "PUT" : "POST",
          body: JSON.stringify({
            paymentMethodCode: paymentMethodForm.paymentMethodCode,
            paymentMethodName: paymentMethodForm.paymentMethodName,
            sortOrder: Number(paymentMethodForm.sortOrder || 1),
            isActive: paymentMethodForm.isActive,
            note: paymentMethodForm.note || null,
          }),
        }
      );
      await loadAll();
      resetPaymentMethodForm();
      showMessage("Payment method saved.");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to save payment method.", "warning");
    }
  }

  async function saveRoomType(e: React.FormEvent) {
    e.preventDefault();
    try {
      await readJson(
        roomTypeForm.roomTypeId
          ? `/api/master-data/room-types/${roomTypeForm.roomTypeId}`
          : "/api/master-data/room-types",
        {
          method: roomTypeForm.roomTypeId ? "PUT" : "POST",
          body: JSON.stringify({
            roomTypeCode: roomTypeForm.roomTypeCode,
            roomTypeName: roomTypeForm.roomTypeName,
            standardRate: Number(roomTypeForm.standardRate || 0),
            sortOrder: Number(roomTypeForm.sortOrder || 1),
            isActive: roomTypeForm.isActive,
            note: roomTypeForm.note || null,
          }),
        }
      );
      await loadAll();
      resetRoomTypeForm();
      showMessage("Room type saved.");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to save room type.", "warning");
    }
  }

  async function saveRoom(e: React.FormEvent) {
    e.preventDefault();
    try {
      await readJson(
        roomForm.roomId
          ? `/api/master-data/rooms/${roomForm.roomId}`
          : "/api/master-data/rooms",
        {
          method: roomForm.roomId ? "PUT" : "POST",
          body: JSON.stringify({
            roomNo: roomForm.roomNo,
            roomTypeId: Number(roomForm.roomTypeId),
            floorName: roomForm.floorName,
            defaultRate: Number(roomForm.defaultRate || 0),
            currentStatus: roomForm.currentStatus,
            isActive: roomForm.isActive,
            note: roomForm.note || null,
          }),
        }
      );
      await loadAll();
      resetRoomForm();
      showMessage("Room saved.");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to save room.", "warning");
    }
  }

  return (
    <AppShell
      title="Master Data Administration"
      description="Packages 1 and 2 setup for operational hotel masters."
    >
      {message ? (
        <div className={`mb-6 rounded-3xl border px-4 py-3 text-sm ${toneClasses(message.tone)}`}>
          {message.text}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
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
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {([
          ["board-basis", "Board Basis"],
          ["outlets", "Outlets"],
          ["restaurant-tables", "Restaurant Tables"],
          ["payment-methods", "Payment Methods"],
          ["room-types", "Room Types"],
          ["rooms", "Rooms"],
        ] as Array<[TabKey, string]>).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`rounded-2xl border px-4 py-2 text-sm ${activeTab === key
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "board-basis" ? (
        <SectionCard title="Board Basis" subtitle="Manage hotel meal plan / board basis master.">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.2fr]">
            <form className="space-y-4" onSubmit={saveBoardBasis}>
              <Input placeholder="Board basis code" value={boardBasisForm.boardBasisCode} onChange={(e) => setBoardBasisForm((p) => ({ ...p, boardBasisCode: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Board basis name" value={boardBasisForm.boardBasisName} onChange={(e) => setBoardBasisForm((p) => ({ ...p, boardBasisName: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Sort order" type="number" value={boardBasisForm.sortOrder} onChange={(e) => setBoardBasisForm((p) => ({ ...p, sortOrder: e.target.value }))} className="h-11 rounded-2xl" />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={boardBasisForm.isActive} onChange={(e) => setBoardBasisForm((p) => ({ ...p, isActive: e.target.checked }))} />
                Active
              </label>
              <div className="flex gap-3">
                <Button type="submit" className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">Save</Button>
                <Button type="button" variant="outline" className="rounded-2xl" onClick={resetBoardBasisForm}>New</Button>
              </div>
            </form>
            <div className="space-y-3">
              {boardBasis.map((row) => (
                <button key={row.boardBasisId} type="button" onClick={() => setBoardBasisForm({
                  boardBasisId: String(row.boardBasisId),
                  boardBasisCode: row.boardBasisCode,
                  boardBasisName: row.boardBasisName,
                  sortOrder: String(row.sortOrder),
                  isActive: row.isActive,
                })} className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{row.boardBasisName}</p>
                      <p className="mt-1 text-sm text-slate-500">{row.boardBasisCode}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs ${row.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>
      ) : null}

      {activeTab === "outlets" ? (
        <SectionCard title="Outlets" subtitle="Manage restaurant / service outlets used by the hotel.">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.2fr]">
            <form className="space-y-4" onSubmit={saveOutlet}>
              <Input placeholder="Outlet code" value={outletForm.outletCode} onChange={(e) => setOutletForm((p) => ({ ...p, outletCode: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Outlet name" value={outletForm.outletName} onChange={(e) => setOutletForm((p) => ({ ...p, outletName: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Location id" type="number" value={outletForm.locationId} onChange={(e) => setOutletForm((p) => ({ ...p, locationId: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Sort order" type="number" value={outletForm.sortOrder} onChange={(e) => setOutletForm((p) => ({ ...p, sortOrder: e.target.value }))} className="h-11 rounded-2xl" />
              <textarea placeholder="Note" value={outletForm.note} onChange={(e) => setOutletForm((p) => ({ ...p, note: e.target.value }))} className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900" />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={outletForm.isActive} onChange={(e) => setOutletForm((p) => ({ ...p, isActive: e.target.checked }))} />
                Active
              </label>
              <div className="flex gap-3">
                <Button type="submit" className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">Save</Button>
                <Button type="button" variant="outline" className="rounded-2xl" onClick={resetOutletForm}>New</Button>
              </div>
            </form>
            <div className="space-y-3">
              {outlets.map((row) => (
                <button key={row.outletId} type="button" onClick={() => setOutletForm({
                  outletId: String(row.outletId),
                  outletCode: row.outletCode,
                  outletName: row.outletName,
                  locationId: row.locationId != null ? String(row.locationId) : "",
                  sortOrder: String(row.sortOrder),
                  isActive: row.isActive,
                  note: row.note ?? "",
                })} className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{row.outletName}</p>
                      <p className="mt-1 text-sm text-slate-500">{row.outletCode}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs ${row.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>
      ) : null}

      {activeTab === "restaurant-tables" ? (
        <SectionCard title="Restaurant Tables" subtitle="Manage outlet table setup used for restaurant job assignment.">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.2fr]">
            <form className="space-y-4" onSubmit={saveRestaurantTable}>
              <select value={tableForm.outletId} onChange={(e) => setTableForm((p) => ({ ...p, outletId: e.target.value }))} className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900">
                {outlets.map((outlet) => (
                  <option key={outlet.outletId} value={String(outlet.outletId)}>{outlet.outletName}</option>
                ))}
              </select>
              <Input placeholder="Table code" value={tableForm.tableCode} onChange={(e) => setTableForm((p) => ({ ...p, tableCode: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Table name" value={tableForm.tableName} onChange={(e) => setTableForm((p) => ({ ...p, tableName: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Seat count" type="number" value={tableForm.seatCount} onChange={(e) => setTableForm((p) => ({ ...p, seatCount: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Sort order" type="number" value={tableForm.sortOrder} onChange={(e) => setTableForm((p) => ({ ...p, sortOrder: e.target.value }))} className="h-11 rounded-2xl" />
              <textarea placeholder="Note" value={tableForm.note} onChange={(e) => setTableForm((p) => ({ ...p, note: e.target.value }))} className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900" />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={tableForm.isActive} onChange={(e) => setTableForm((p) => ({ ...p, isActive: e.target.checked }))} />
                Active
              </label>
              <div className="flex gap-3">
                <Button type="submit" className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">Save</Button>
                <Button type="button" variant="outline" className="rounded-2xl" onClick={resetTableForm}>New</Button>
              </div>
            </form>
            <div className="space-y-3">
              {restaurantTables.map((row) => (
                <button key={row.restaurantTableId} type="button" onClick={() => setTableForm({
                  restaurantTableId: String(row.restaurantTableId),
                  outletId: String(row.outletId),
                  tableCode: row.tableCode,
                  tableName: row.tableName,
                  seatCount: String(row.seatCount),
                  sortOrder: String(row.sortOrder),
                  isActive: row.isActive,
                  note: row.note ?? "",
                })} className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{row.tableName}</p>
                      <p className="mt-1 text-sm text-slate-500">{row.outletName} • {row.tableCode} • {row.seatCount} seats</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs ${row.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>
      ) : null}

      {activeTab === "payment-methods" ? (
        <SectionCard title="Payment Methods" subtitle="Manage cashiering / settlement method master values.">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.2fr]">
            <form className="space-y-4" onSubmit={savePaymentMethod}>
              <Input placeholder="Payment method code" value={paymentMethodForm.paymentMethodCode} onChange={(e) => setPaymentMethodForm((p) => ({ ...p, paymentMethodCode: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Payment method name" value={paymentMethodForm.paymentMethodName} onChange={(e) => setPaymentMethodForm((p) => ({ ...p, paymentMethodName: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Sort order" type="number" value={paymentMethodForm.sortOrder} onChange={(e) => setPaymentMethodForm((p) => ({ ...p, sortOrder: e.target.value }))} className="h-11 rounded-2xl" />
              <textarea placeholder="Note" value={paymentMethodForm.note} onChange={(e) => setPaymentMethodForm((p) => ({ ...p, note: e.target.value }))} className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900" />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={paymentMethodForm.isActive} onChange={(e) => setPaymentMethodForm((p) => ({ ...p, isActive: e.target.checked }))} />
                Active
              </label>
              <div className="flex gap-3">
                <Button type="submit" className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">Save</Button>
                <Button type="button" variant="outline" className="rounded-2xl" onClick={resetPaymentMethodForm}>New</Button>
              </div>
            </form>
            <div className="space-y-3">
              {paymentMethods.map((row) => (
                <button key={row.paymentMethodId} type="button" onClick={() => setPaymentMethodForm({
                  paymentMethodId: String(row.paymentMethodId),
                  paymentMethodCode: row.paymentMethodCode,
                  paymentMethodName: row.paymentMethodName,
                  sortOrder: String(row.sortOrder),
                  isActive: row.isActive,
                  note: row.note ?? "",
                })} className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{row.paymentMethodName}</p>
                      <p className="mt-1 text-sm text-slate-500">{row.paymentMethodCode}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs ${row.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>
      ) : null}

      {activeTab === "room-types" ? (
        <SectionCard title="Room Types" subtitle="Manage room type master with standard rate defaults.">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.2fr]">
            <form className="space-y-4" onSubmit={saveRoomType}>
              <Input placeholder="Room type code" value={roomTypeForm.roomTypeCode} onChange={(e) => setRoomTypeForm((p) => ({ ...p, roomTypeCode: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Room type name" value={roomTypeForm.roomTypeName} onChange={(e) => setRoomTypeForm((p) => ({ ...p, roomTypeName: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Standard rate" type="number" value={roomTypeForm.standardRate} onChange={(e) => setRoomTypeForm((p) => ({ ...p, standardRate: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Sort order" type="number" value={roomTypeForm.sortOrder} onChange={(e) => setRoomTypeForm((p) => ({ ...p, sortOrder: e.target.value }))} className="h-11 rounded-2xl" />
              <textarea placeholder="Note" value={roomTypeForm.note} onChange={(e) => setRoomTypeForm((p) => ({ ...p, note: e.target.value }))} className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900" />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={roomTypeForm.isActive} onChange={(e) => setRoomTypeForm((p) => ({ ...p, isActive: e.target.checked }))} />
                Active
              </label>
              <div className="flex gap-3">
                <Button type="submit" className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">Save</Button>
                <Button type="button" variant="outline" className="rounded-2xl" onClick={resetRoomTypeForm}>New</Button>
              </div>
            </form>
            <div className="space-y-3">
              {roomTypes.map((row) => (
                <button key={row.roomTypeId} type="button" onClick={() => setRoomTypeForm({
                  roomTypeId: String(row.roomTypeId),
                  roomTypeCode: row.roomTypeCode,
                  roomTypeName: row.roomTypeName,
                  standardRate: String(row.standardRate),
                  sortOrder: String(row.sortOrder),
                  isActive: row.isActive,
                  note: row.note ?? "",
                })} className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{row.roomTypeName}</p>
                      <p className="mt-1 text-sm text-slate-500">{row.roomTypeCode} • LKR {Number(row.standardRate ?? 0).toLocaleString()}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs ${row.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>
      ) : null}

      {activeTab === "rooms" ? (
        <SectionCard title="Rooms" subtitle="Manage room master, assigned room type, and operational defaults.">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.2fr]">
            <form className="space-y-4" onSubmit={saveRoom}>
              <Input placeholder="Room no" value={roomForm.roomNo} onChange={(e) => setRoomForm((p) => ({ ...p, roomNo: e.target.value }))} className="h-11 rounded-2xl" />
              <select value={roomForm.roomTypeId} onChange={(e) => setRoomForm((p) => ({ ...p, roomTypeId: e.target.value }))} className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900">
                {roomTypes.map((row) => (
                  <option key={row.roomTypeId} value={String(row.roomTypeId)}>{row.roomTypeName}</option>
                ))}
              </select>
              <Input placeholder="Floor name" value={roomForm.floorName} onChange={(e) => setRoomForm((p) => ({ ...p, floorName: e.target.value }))} className="h-11 rounded-2xl" />
              <Input placeholder="Default rate" type="number" value={roomForm.defaultRate} onChange={(e) => setRoomForm((p) => ({ ...p, defaultRate: e.target.value }))} className="h-11 rounded-2xl" />
              <select value={roomForm.currentStatus} onChange={(e) => setRoomForm((p) => ({ ...p, currentStatus: e.target.value }))} className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900">
                {ROOM_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <textarea placeholder="Note" value={roomForm.note} onChange={(e) => setRoomForm((p) => ({ ...p, note: e.target.value }))} className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900" />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={roomForm.isActive} onChange={(e) => setRoomForm((p) => ({ ...p, isActive: e.target.checked }))} />
                Active
              </label>
              <div className="flex gap-3">
                <Button type="submit" className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">Save</Button>
                <Button type="button" variant="outline" className="rounded-2xl" onClick={resetRoomForm}>New</Button>
              </div>
            </form>
            <div className="space-y-3">
              {rooms.map((row) => (
                <button key={row.roomId} type="button" onClick={() => setRoomForm({
                  roomId: String(row.roomId),
                  roomNo: row.roomNo,
                  roomTypeId: row.roomTypeId != null ? String(row.roomTypeId) : "",
                  floorName: row.floorName,
                  defaultRate: String(row.defaultRate),
                  currentStatus: row.currentStatus,
                  isActive: row.isActive,
                  note: row.note ?? "",
                })} className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">Room {row.roomNo}</p>
                      <p className="mt-1 text-sm text-slate-500">{row.roomTypeName} • {row.floorName} • LKR {Number(row.defaultRate ?? 0).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs ${row.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {row.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700">
                        {row.currentStatus}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>
      ) : null}
    </AppShell>
  );
}
