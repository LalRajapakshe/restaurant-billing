"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Plus,
  RefreshCcw,
  UtensilsCrossed,
  Wallet,
  Wine,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  guestTypes,
  GuestType,
  mealTypes,
  MealType,
  RestaurantBillType,
  restaurantBillTypes,
} from "@/types/restaurant";

type PaymentMethod = "Cash" | "Card" | "Transfer";
type JobStatus = "Open" | "Partially Paid" | "Ready to Close" | "Closed";
type ActionTab = "job" | "bill" | "payment";
type PanelMode = "normal" | "minimized" | "maximized";

type ActiveJob = {
  id: string;
  table: string;
  customer: string;
  balance: number;
  bills: number;
  status: JobStatus;
  guestType: GuestType;
  roomNo?: string;
  outlet: string;
} | null;

type ActiveBill = {
  billNo: string;
  balance: number;
};

type JobOption = {
  id: string;
  table: string;
  customer: string;
  status: JobStatus;
  guestType: GuestType;
  outlet: string;
  roomNo?: string;
  balance: number;
};

type RoomGuestOption = {
  roomNo: string;
  guestName: string;
  mobile: string;
  boardBasis: string;
  stayId: number;
  roomId: number;
};

type RestaurantItemOption = {
  itemId: number;
  itemCode: string;
  itemName: string;
  itemAlias?: string | null;
  itemCategoryId?: number | null;
  unitPrice?: number | null;
};

type NewJobForm = {
  table: string;
  mobile: string;
  customer: string;
  guestType: GuestType;
  roomNo: string;
  outlet: string;
};

type BillForm = {
  type: RestaurantBillType;
  mealType: MealType;
  itemId: string;
  itemName: string;
  qty: string;
  unitPrice: string;
};

type PaymentForm = {
  target: string;
  amount: string;
  method: PaymentMethod;
};

type FrontDeskActionsPanelProps = {
  actionTab: ActionTab;
  setActionTab: (tab: ActionTab) => void;
  activeJob: ActiveJob;
  activeBills: ActiveBill[];
  jobOptions: JobOption[];
  onSelectActiveJob: (jobId: string) => void;
  availableTables: string[];
  outletOptions: string[];
  roomGuestOptions: RoomGuestOption[];
  itemOptions: RestaurantItemOption[];
  itemsLoading: boolean;
  onReloadItemOptions: () => void;
  newJobForm: NewJobForm;
  setNewJobForm: React.Dispatch<React.SetStateAction<NewJobForm>>;
  onCreateJob: (e: React.FormEvent) => void;
  billForm: BillForm;
  setBillForm: React.Dispatch<React.SetStateAction<BillForm>>;
  onAddBill: (e: React.FormEvent) => void;
  paymentForm: PaymentForm;
  setPaymentForm: React.Dispatch<React.SetStateAction<PaymentForm>>;
  onApplyPayment: (fullSettlement: boolean) => void;
  onPostToFolio: () => void;
  isCreatingJob: boolean;
  isSavingBill: boolean;
  isApplyingPayment: boolean;
  isCompletingSettlement: boolean;
  isPostingToFolio: boolean;
  currency: (value: number) => string;
};

export default function FrontDeskActionsPanel({
  actionTab,
  setActionTab,
  activeJob,
  activeBills,
  jobOptions,
  onSelectActiveJob,
  availableTables,
  outletOptions,
  roomGuestOptions,
  itemOptions,
  itemsLoading,
  onReloadItemOptions,
  newJobForm,
  setNewJobForm,
  onCreateJob,
  billForm,
  setBillForm,
  onAddBill,
  paymentForm,
  setPaymentForm,
  onApplyPayment,
  onPostToFolio,
  isCreatingJob,
  isSavingBill,
  isApplyingPayment,
  isCompletingSettlement,
  isPostingToFolio,
  currency,
}: FrontDeskActionsPanelProps) {
  const [panelMode, setPanelMode] = useState<PanelMode>("normal");

  const selectedRoomGuest = useMemo(() => {
    return roomGuestOptions.find((item) => item.roomNo === newJobForm.roomNo) ?? null;
  }, [roomGuestOptions, newJobForm.roomNo]);

  const selectedItem = useMemo(() => {
    return itemOptions.find((item) => String(item.itemId) === billForm.itemId) ?? null;
  }, [itemOptions, billForm.itemId]);

  const billPreviewTotal = useMemo(() => {
    return Math.max(0, Number(billForm.qty || 0) * Number(billForm.unitPrice || 0));
  }, [billForm.qty, billForm.unitPrice]);

  const paymentTargets = useMemo(() => {
    return activeBills.filter((bill) => bill.balance > 0);
  }, [activeBills]);

  const isMinimized = panelMode === "minimized";
  const isMaximized = panelMode === "maximized";
  const isRoomGuestJob = activeJob?.guestType === "Room Guest";

  return (
    <div className={isMaximized ? "fixed inset-4 z-50" : ""}>
      {isMaximized ? (
        <div
          className="absolute inset-0 rounded-[30px] bg-slate-950/35 backdrop-blur-sm"
          onClick={() => setPanelMode("normal")}
        />
      ) : null}

      <Card
        className={[
          "relative border-white/60 bg-white/95 shadow-sm backdrop-blur transition-all",
          isMaximized
            ? "h-full overflow-auto rounded-[28px] shadow-2xl"
            : "rounded-[28px]",
        ].join(" ")}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Restaurant Billing Actions</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                DB-backed job, bill, payment, and folio posting flow.
              </p>

              {activeJob ? (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{activeJob.id}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{activeJob.table}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{activeJob.outlet}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{activeJob.guestType}</span>
                  {activeJob.roomNo ? (
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                      Room {activeJob.roomNo}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-2xl"
                onClick={() =>
                  setPanelMode((prev) => (prev === "minimized" ? "normal" : "minimized"))
                }
              >
                {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-2xl"
                onClick={() =>
                  setPanelMode((prev) => (prev === "maximized" ? "normal" : "maximized"))
                }
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>

              {isMaximized ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-2xl"
                  onClick={() => setPanelMode("normal")}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>

        {isMinimized ? (
          <CardContent className="pt-0">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {activeJob ? `${activeJob.id} • ${activeJob.table}` : "No active job selected"}
                  </p>
                  <p className="mt-1 text-slate-500">
                    Current tab:{" "}
                    <span className="font-medium text-slate-700">
                      {actionTab === "job"
                        ? "New Job"
                        : actionTab === "bill"
                          ? "Add Bill"
                          : "Payment / Folio"}
                    </span>
                  </p>
                </div>

                {activeJob ? (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Outstanding</p>
                    <p className="font-semibold text-slate-900">{currency(activeJob.balance)}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            {jobOptions.length > 0 ? (
              <div className="mb-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Switch Selected Table / Job
                    </label>
                    <select
                      value={activeJob?.id ?? ""}
                      onChange={(e) => onSelectActiveJob(e.target.value)}
                      className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                    >
                      {jobOptions.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.table} • {job.id} • {job.customer} • {job.status}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500">
                      This lets the user change the working table/job directly from this panel, including when maximized.
                    </p>
                  </div>

                  {activeJob ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {activeJob.table} • {activeJob.id}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {activeJob.customer} • {currency(activeJob.balance)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <Tabs value={actionTab} onValueChange={(v) => setActionTab(v as ActionTab)}>
              <TabsList className="grid w-full grid-cols-3 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                <TabsTrigger value="job" className="rounded-xl">New Job</TabsTrigger>
                <TabsTrigger value="bill" className="rounded-xl">Add Bill</TabsTrigger>
                <TabsTrigger value="payment" className="rounded-xl">Payment / Folio</TabsTrigger>
              </TabsList>

              <TabsContent value="job" className="mt-4">
                <form className="space-y-4" onSubmit={onCreateJob}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Guest Type</label>
                      <select
                        value={newJobForm.guestType}
                        onChange={(e) =>
                          setNewJobForm((prev) => ({
                            ...prev,
                            guestType: e.target.value as GuestType,
                            roomNo: e.target.value === "FIT" ? "" : prev.roomNo,
                          }))
                        }
                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                      >
                        {guestTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {newJobForm.guestType === "Room Guest" ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">In-house Guest / Room</label>
                      <select
                        value={newJobForm.roomNo}
                        onChange={(e) => {
                          const roomNo = e.target.value;
                          const selected = roomGuestOptions.find((item) => item.roomNo === roomNo);
                          setNewJobForm((prev) => ({
                            ...prev,
                            roomNo,
                            customer: selected?.guestName ?? prev.customer,
                            mobile: selected?.mobile ?? prev.mobile,
                          }));
                        }}
                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                      >
                        <option value="">Select occupied room</option>
                        {roomGuestOptions.map((room) => (
                          <option key={room.roomNo} value={room.roomNo}>
                            Room {room.roomNo} • {room.guestName} • {room.boardBasis}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Available Table</label>
                    <select
                      value={newJobForm.table}
                      onChange={(e) => setNewJobForm((prev) => ({ ...prev, table: e.target.value }))}
                      className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                    >
                      {availableTables.length > 0 ? (
                        availableTables.map((table) => (
                          <option key={table} value={table}>{table}</option>
                        ))
                      ) : (
                        <option value="">No table available</option>
                      )}
                    </select>
                  </div>

                  {selectedRoomGuest && newJobForm.guestType === "Room Guest" ? (
                    <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
                      In-house guest selected: Room {selectedRoomGuest.roomNo} • {selectedRoomGuest.guestName} • {selectedRoomGuest.boardBasis}
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Customer Mobile</label>
                    <Input
                      value={newJobForm.mobile}
                      onChange={(e) => setNewJobForm((prev) => ({ ...prev, mobile: e.target.value }))}
                      placeholder="077 123 4567"
                      className="h-11 rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Customer Name / Label</label>
                    <Input
                      value={newJobForm.customer}
                      onChange={(e) => setNewJobForm((prev) => ({ ...prev, customer: e.target.value }))}
                      placeholder="Walk-in Customer"
                      className="h-11 rounded-2xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                    disabled={availableTables.length === 0 || isCreatingJob}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreatingJob ? "Opening Job..." : "Open Restaurant Job"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="bill" className="mt-4">
                {activeJob ? (
                  activeJob.status === "Closed" ? (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      This job is already closed. Open a new job to add more bills.
                    </div>
                  ) : (
                    <form className="space-y-4" onSubmit={onAddBill}>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Selected Job</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{activeJob.id}</p>
                        <p className="text-sm text-slate-500">
                          {activeJob.customer} • {activeJob.table} • {activeJob.outlet}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {activeJob.guestType}{activeJob.roomNo ? ` • Room ${activeJob.roomNo}` : ""}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Outlet / Restaurant Location</label>
                        <select
                          value={newJobForm.outlet}
                          onChange={(e) =>
                            setNewJobForm((prev) => ({ ...prev, outlet: e.target.value }))
                          }
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                        >
                          {outletOptions.map((outlet) => (
                            <option key={outlet} value={outlet}>
                              {outlet}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-500">
                          Choose the restaurant location here while preparing the bill.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Billing Type</label>
                        <select
                          value={billForm.type}
                          onChange={(e) =>
                            setBillForm((prev) => ({
                              ...prev,
                              type: e.target.value as RestaurantBillType,
                            }))
                          }
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                        >
                          {restaurantBillTypes.map((type) => (
                            <option
                              key={type}
                              value={type}
                              disabled={type === "Main Meal" && activeJob.guestType !== "Room Guest"}
                            >
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {billForm.type === "Main Meal" ? (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Meal Type</label>
                          <select
                            value={billForm.mealType}
                            onChange={(e) =>
                              setBillForm((prev) => ({
                                ...prev,
                                mealType: e.target.value as MealType,
                              }))
                            }
                            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                          >
                            {mealTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <label className="text-sm font-medium text-slate-700">Item Master</label>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-9 rounded-2xl"
                              onClick={onReloadItemOptions}
                              disabled={itemsLoading}
                            >
                              <RefreshCcw className="mr-2 h-4 w-4" />
                              {itemsLoading ? "Loading..." : "Reload Items"}
                            </Button>
                          </div>
                          <select
                            value={billForm.itemId}
                            onChange={(e) => {
                              const itemId = e.target.value;
                              const item = itemOptions.find((option) => String(option.itemId) === itemId);
                              setBillForm((prev) => ({
                                ...prev,
                                itemId,
                                itemName: item?.itemName ?? prev.itemName,
                                unitPrice:
                                  item?.unitPrice != null
                                    ? String(item.unitPrice)
                                    : prev.unitPrice,
                              }));
                            }}
                            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                          >
                            <option value="">
                              {itemsLoading ? "Loading items..." : itemOptions.length > 0 ? "Select item" : "No items loaded"}
                            </option>
                            {itemOptions.map((item) => (
                              <option key={item.itemId} value={String(item.itemId)}>
                                {item.itemName}{item.itemAlias ? ` • ${item.itemAlias}` : ""}
                              </option>
                            ))}
                          </select>
                          {itemOptions.length === 0 && !itemsLoading ? (
                            <p className="text-xs text-amber-700">
                              Item list is empty. Use Reload Items to pull the live ERP item master again.
                            </p>
                          ) : (
                            <p className="text-xs text-slate-500">
                              Live ERP item master records available: {itemOptions.length}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          {billForm.type === "Main Meal" ? "Display Item / Note" : "Item Name"}
                        </label>
                        <Input
                          value={billForm.itemName}
                          onChange={(e) =>
                            setBillForm((prev) => ({ ...prev, itemName: e.target.value }))
                          }
                          placeholder={
                            billForm.type === "Main Meal" ? "Main Meal - Lunch" : "Chicken Fried Rice"
                          }
                          className="h-11 rounded-2xl"
                        />
                        {selectedItem ? (
                          <p className="text-xs text-slate-500">
                            Item code {selectedItem.itemCode}
                            {selectedItem.itemAlias ? ` • ${selectedItem.itemAlias}` : ""}
                          </p>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Qty</label>
                          <Input
                            type="number"
                            min="1"
                            value={billForm.qty}
                            onChange={(e) =>
                              setBillForm((prev) => ({ ...prev, qty: e.target.value }))
                            }
                            className="h-11 rounded-2xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Unit Price</label>
                          <Input
                            type="number"
                            min="1"
                            value={billForm.unitPrice}
                            onChange={(e) =>
                              setBillForm((prev) => ({ ...prev, unitPrice: e.target.value }))
                            }
                            placeholder="2500"
                            className="h-11 rounded-2xl"
                          />
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Bill Preview Total</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">
                          {currency(billPreviewTotal)}
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="h-11 w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                        disabled={isSavingBill}
                      >
                        {billForm.type === "KOT" ? (
                          <ChefHat className="mr-2 h-4 w-4" />
                        ) : billForm.type === "BOT" ? (
                          <Wine className="mr-2 h-4 w-4" />
                        ) : (
                          <UtensilsCrossed className="mr-2 h-4 w-4" />
                        )}
                        {isSavingBill ? "Saving Bill..." : "Add Bill to Job"}
                      </Button>
                    </form>
                  )
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                    Select a job first.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="payment" className="mt-4">
                {activeJob ? (
                  isRoomGuestJob ? (
                    <div className="space-y-4">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Selected Room Guest Job</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{activeJob.id}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {activeJob.customer} • Room {activeJob.roomNo} • {activeJob.outlet}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Posting Target</label>
                        <select
                          value={paymentForm.target}
                          onChange={(e) => {
                            const target = e.target.value;
                            setPaymentForm((prev) => ({ ...prev, target }));
                          }}
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                        >
                          <option value="ALL">All outstanding bills</option>
                          {paymentTargets.map((bill) => (
                            <option key={bill.billNo} value={bill.billNo}>
                              {bill.billNo} • {currency(bill.balance)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
                        Room guest billing is posted to Front Office folio instead of direct restaurant settlement.
                      </div>

                      <Button
                        type="button"
                        className="h-12 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                        onClick={onPostToFolio}
                        disabled={activeJob.balance === 0 || isPostingToFolio}
                      >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        {isPostingToFolio ? "Posting to Folio..." : "Post to Room Folio"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Selected FIT Job</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{activeJob.id}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {activeJob.customer} • {activeJob.table} • {activeJob.outlet}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Target Bill</label>
                        <select
                          value={paymentForm.target}
                          onChange={(e) => {
                            const target = e.target.value;
                            const selected = paymentTargets.find((bill) => bill.billNo === target);
                            setPaymentForm((prev) => ({
                              ...prev,
                              target,
                              amount:
                                target === "ALL"
                                  ? String(activeJob.balance)
                                  : String(selected?.balance ?? prev.amount),
                            }));
                          }}
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                        >
                          <option value="ALL">All outstanding bills</option>
                          {paymentTargets.map((bill) => (
                            <option key={bill.billNo} value={bill.billNo}>
                              {bill.billNo} • {currency(bill.balance)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Amount</label>
                        <Input
                          type="number"
                          min="1"
                          value={paymentForm.amount}
                          onChange={(e) =>
                            setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))
                          }
                          className="h-11 rounded-2xl"
                        />
                        <p className="text-xs text-slate-500">
                          {paymentForm.target === "ALL"
                            ? `Current total outstanding: ${currency(activeJob.balance)}`
                            : `Selected bill balance: ${currency(
                                paymentTargets.find((bill) => bill.billNo === paymentForm.target)?.balance ?? 0
                              )}`}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Payment Method</label>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {(["Cash", "Card", "Transfer"] as PaymentMethod[]).map((method) => {
                            const active = paymentForm.method === method;
                            return (
                              <button
                                key={method}
                                type="button"
                                onClick={() =>
                                  setPaymentForm((prev) => ({
                                    ...prev,
                                    method,
                                  }))
                                }
                                className={`rounded-3xl border p-4 text-left shadow-sm ${
                                  active
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-900"
                                }`}
                              >
                                <Wallet className="mb-3 h-5 w-5" />
                                <p className="font-medium">{method}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <Separator />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Button
                          type="button"
                          className="h-12 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                          onClick={() => onApplyPayment(false)}
                          disabled={activeJob.balance === 0 || isApplyingPayment || isCompletingSettlement}
                        >
                          {isApplyingPayment ? "Applying Payment..." : "Apply Payment"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12 rounded-2xl border-slate-300 bg-white"
                          onClick={() => onApplyPayment(true)}
                          disabled={activeJob.balance === 0 || isApplyingPayment || isCompletingSettlement}
                        >
                          {isCompletingSettlement ? "Completing Settlement..." : "Complete Full Settlement"}
                          {!isCompletingSettlement ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                    Select a job first.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
