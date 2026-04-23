"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleDollarSign,
  Hotel,
  TableProperties,
  Wallet,
} from "lucide-react";

import BillList from "@/components/frontdesk/bill-list";
import FrontDeskActionsPanel from "@/components/frontdesk/frontdesk-actions-panel";
import JobList from "@/components/frontdesk/job-list";
import SelectedJobSummary from "@/components/frontdesk/selected-job-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AppShell from "@/components/layout/app-shell";
import { mockOutlets } from "@/data/mock-outlets";
import { GuestType, MealType, OutletRecord, RestaurantBillType } from "@/types/restaurant";

type JobStatus = "Open" | "Partially Paid" | "Ready to Close" | "Closed";
type MessageTone = "success" | "warning" | "info";
type ActionTab = "job" | "bill" | "payment";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type JobApiRow = {
  restaurantJobId: number;
  jobNo: string;
  outletLocationId: number;
  tableNo: string;
  guestType: GuestType;
  stayId?: number | null;
  roomId?: number | null;
  roomNo?: string | null;
  customerName: string;
  mobileNo?: string | null;
  jobStatus: JobStatus;
  openedAt: string;
  closedAt?: string | null;
};

type BillApiRow = {
  restaurantBillId: number;
  billNo: string;
  billType: RestaurantBillType;
  mealType?: MealType | null;
  grossAmount: number;
  paidAmount: number;
  balanceAmount: number;
  billStatus: string;
  postedToFolio: boolean;
  postedFolioEntryId?: number | null;
  postedAt?: string | null;
  createdAt: string;
  items: Array<{
    restaurantBillItemId: number;
    restaurantBillId: number;
    itemId?: number | null;
    itemGroupId?: number | null;
    itemCategoryId?: number | null;
    itemName: string;
    qty: number;
    unitPrice: number;
    lineAmount: number;
    note?: string | null;
  }>;
};

type RoomOptionApi = {
  roomId: number;
  roomNo: string;
  currentStatus: string;
  stayId?: number | null;
  guestName?: string | null;
  mobileNo?: string | null;
  boardBasisName?: string | null;
};

type ItemOptionApi = {
  itemId: number;
  itemCode: string;
  itemName: string;
  itemAlias?: string | null;
  itemCategoryId?: number | null;
  unitPrice?: number | null;
};

type Job = {
  dbId: number;
  id: string;
  table: string;
  mobile: string;
  customer: string;
  openedAt: string;
  isClosed: boolean;
  guestType: GuestType;
  roomNo?: string;
  outlet: string;
  stayId?: number | null;
  roomId?: number | null;
};

type Bill = {
  dbId?: number;
  billNo: string;
  type: RestaurantBillType;
  mealType?: MealType | null;
  guestType: GuestType;
  outlet: string;
  roomNo?: string;
  amount: number;
  paid: number;
  balance: number;
  createdAt: string;
  items: Array<{
    name: string;
    qty: number;
    amount: number;
  }>;
};

type JobMetrics = {
  bills: number;
  typeMix: RestaurantBillType[];
  subtotal: number;
  paid: number;
  balance: number;
  status: JobStatus;
};

type JobView = Job & JobMetrics;

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

const ALL_TABLES = [
  "T01", "T02", "T03", "T04", "T05", "T06",
  "T07", "T08", "T09", "T10", "T11", "T12",
  "VIP-01", "VIP-02",
];

const FILTERS = [
  "All",
  "Open",
  "Partially Paid",
  "Ready to Close",
  "Closed",
  "FIT",
  "Room Guest",
] as const;

function currency(value: number) {
  return `LKR ${value.toLocaleString()}`;
}

function formatTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
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

function computeJobMetrics(job: Job, bills: Bill[]): JobMetrics {
  const subtotal = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paid = bills.reduce((sum, bill) => sum + bill.paid, 0);
  const balance = bills.reduce((sum, bill) => sum + bill.balance, 0);
  const typeMix = Array.from(new Set(bills.map((bill) => bill.type)));
  const billsCount = bills.length;

  let status: JobStatus = "Open";

  if (job.isClosed) {
    status = "Closed";
  } else if (subtotal > 0 && balance === 0) {
    status = "Closed";
  } else if (paid === 0) {
    status = "Open";
  } else if (balance <= 500) {
    status = "Ready to Close";
  } else {
    status = "Partially Paid";
  }

  return {
    bills: billsCount,
    typeMix,
    subtotal,
    paid,
    balance,
    status,
  };
}

function toneClasses(tone: MessageTone) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function outletNameFromLocationId(locationId: number, outlets: OutletRecord[]) {
  if (locationId === 1) {
    return outlets[0]?.name ?? "Main Restaurant";
  }
  return outlets[0]?.name ?? "Main Restaurant";
}

export default function RestaurantBillingFrontDeskPage() {
  const [actionTab, setActionTab] = useState<ActionTab>("bill");
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("All");
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [billsByJob, setBillsByJob] = useState<Record<string, Bill[]>>({});
  const [activeJobId, setActiveJobId] = useState<string>("");
  const [outlets] = useState<OutletRecord[]>(mockOutlets);
  const [roomGuestOptions, setRoomGuestOptions] = useState<RoomGuestOption[]>([]);
  const [itemOptions, setItemOptions] = useState<RestaurantItemOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ tone: MessageTone; text: string } | null>(null);

  const actionPanelRef = useRef<HTMLDivElement | null>(null);

  const [newJobForm, setNewJobForm] = useState({
    table: "T01",
    mobile: "",
    customer: "",
    guestType: "FIT" as GuestType,
    roomNo: "",
    outlet: mockOutlets[0]?.name ?? "Main Restaurant",
  });

  const [billForm, setBillForm] = useState({
    type: "KOT" as RestaurantBillType,
    mealType: "Breakfast" as MealType,
    itemId: "",
    itemName: "",
    qty: "1",
    unitPrice: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    target: "ALL",
    amount: "",
    method: "Cash" as "Cash" | "Card" | "Transfer",
  });

  const jobsView = useMemo<JobView[]>(() => {
    return jobs.map((job) => {
      const metrics = computeJobMetrics(job, billsByJob[job.id] ?? []);
      return { ...job, ...metrics };
    });
  }, [jobs, billsByJob]);

  const activeJob = useMemo(() => {
    return jobsView.find((job) => job.id === activeJobId) ?? jobsView[0] ?? null;
  }, [jobsView, activeJobId]);

  const activeBills = activeJob ? billsByJob[activeJob.id] ?? [] : [];

  const availableTables = useMemo(() => {
    const occupied = new Set(
      jobsView.filter((job) => job.status !== "Closed").map((job) => job.table)
    );
    return ALL_TABLES.filter((table) => !occupied.has(table));
  }, [jobsView]);

  const filteredJobs = useMemo(() => {
    return jobsView.filter((job) => {
      const filterOk =
        activeFilter === "All"
          ? true
          : activeFilter === "FIT" || activeFilter === "Room Guest"
            ? job.guestType === activeFilter
            : job.status === activeFilter;

      const q = search.trim().toLowerCase();
      const searchOk =
        !q ||
        job.id.toLowerCase().includes(q) ||
        job.table.toLowerCase().includes(q) ||
        job.mobile.toLowerCase().includes(q) ||
        job.customer.toLowerCase().includes(q);

      return filterOk && searchOk;
    });
  }, [jobsView, activeFilter, search]);

  const openJobsCount = jobsView.filter((job) => job.status !== "Closed").length;
  const todaySales = jobsView.reduce((sum, job) => sum + job.subtotal, 0);
  const outstandingTotal = jobsView.reduce((sum, job) => sum + job.balance, 0);
  const roomGuestJobs = jobsView.filter((job) => job.guestType === "Room Guest" && job.status !== "Closed").length;

  function showMessage(text: string, tone: MessageTone = "success") {
    setMessage({ text, tone });
  }

  function openActionPanel(tab: ActionTab) {
    setActionTab(tab);
    requestAnimationFrame(() => {
      actionPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  async function loadRoomGuestOptions() {
    const roomRows = await readJson<RoomOptionApi[]>("/api/rooms");
    const next = roomRows
      .filter((room) => room.currentStatus === "Occupied" && !!room.stayId)
      .map((room) => ({
        roomNo: room.roomNo,
        guestName: room.guestName ?? "",
        mobile: room.mobileNo ?? "",
        boardBasis: room.boardBasisName ?? "Room Only",
        stayId: Number(room.stayId),
        roomId: Number(room.roomId),
      }));

    setRoomGuestOptions(next);
  }

  async function loadItemOptions() {
    const itemRows = await readJson<ItemOptionApi[]>("/api/erp/items");
    setItemOptions(
      itemRows.map((row) => ({
        itemId: Number(row.itemId),
        itemCode: row.itemCode,
        itemName: row.itemName,
        itemAlias: row.itemAlias ?? null,
        itemCategoryId: row.itemCategoryId ?? null,
        unitPrice: row.unitPrice != null ? Number(row.unitPrice) : null,
      }))
    );
  }

  async function loadJobsAndBills(preferredJobNo?: string) {
    const jobRows = await readJson<JobApiRow[]>("/api/restaurant/jobs");
    const mappedJobs: Job[] = jobRows.map((row) => ({
      dbId: Number(row.restaurantJobId),
      id: row.jobNo,
      table: row.tableNo,
      mobile: row.mobileNo ?? "",
      customer: row.customerName,
      openedAt: formatTimeLabel(row.openedAt),
      isClosed: row.jobStatus === "Closed",
      guestType: row.guestType,
      roomNo: row.roomNo ?? "",
      outlet: outletNameFromLocationId(Number(row.outletLocationId ?? 1), outlets),
      stayId: row.stayId ?? null,
      roomId: row.roomId ?? null,
    }));

    const billsEntries = await Promise.all(
      mappedJobs.map(async (job) => {
        const billRows = await readJson<BillApiRow[]>(
          `/api/restaurant/jobs/${job.dbId}/bills`
        );
        const mappedBills: Bill[] = billRows.map((billRow) => ({
          dbId: Number(billRow.restaurantBillId),
          billNo: billRow.billNo,
          type: billRow.billType,
          mealType: billRow.mealType ?? null,
          guestType: job.guestType,
          outlet: job.outlet,
          roomNo: job.roomNo,
          amount: Number(billRow.grossAmount ?? 0),
          paid: Number(billRow.paidAmount ?? 0),
          balance: Number(billRow.balanceAmount ?? 0),
          createdAt: formatTimeLabel(billRow.createdAt),
          items: (billRow.items ?? []).map((item) => ({
            name: item.itemName,
            qty: Number(item.qty ?? 0),
            amount: Number(item.lineAmount ?? 0),
          })),
        }));
        return [job.id, mappedBills] as const;
      })
    );

    setJobs(mappedJobs);
    setBillsByJob(Object.fromEntries(billsEntries));

    const nextActiveJobId =
      preferredJobNo ??
      activeJobId ??
      mappedJobs[0]?.id ??
      "";

    setActiveJobId(nextActiveJobId);

    if (availableTables.length > 0) {
      setNewJobForm((prev) => ({
        ...prev,
        table: availableTables.includes(prev.table) ? prev.table : availableTables[0] ?? "T01",
      }));
    }
  }

  async function refreshRestaurant(preferredJobNo?: string) {
    await loadJobsAndBills(preferredJobNo);
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setLoading(true);
        await Promise.all([loadRoomGuestOptions(), loadItemOptions()]);
        if (!mounted) return;
        await loadJobsAndBills();
      } catch (error) {
        console.error("Restaurant Billing init failed", error);
        if (mounted) {
          showMessage("Failed to load restaurant billing DB data.", "warning");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void init();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeJob && jobsView.length > 0) {
      setActiveJobId(jobsView[0].id);
    }
  }, [activeJob, jobsView]);

  useEffect(() => {
    if (availableTables.length > 0 && !availableTables.includes(newJobForm.table)) {
      setNewJobForm((prev) => ({ ...prev, table: availableTables[0] }));
    }
  }, [availableTables, newJobForm.table]);

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();

    if (!newJobForm.table) {
      showMessage("No available table found for a new restaurant job.", "warning");
      return;
    }

    let selectedRoomGuest: RoomGuestOption | null = null;

    if (newJobForm.guestType === "Room Guest") {
      selectedRoomGuest =
        roomGuestOptions.find((item) => item.roomNo === newJobForm.roomNo) ?? null;

      if (!selectedRoomGuest) {
        showMessage("Select an occupied room for room guest billing.", "warning");
        return;
      }
    }

    if (newJobForm.guestType === "FIT" && !newJobForm.customer.trim()) {
      showMessage("Customer name is required for FIT jobs.", "warning");
      return;
    }

    try {
      const created = await readJson<JobApiRow>("/api/restaurant/jobs", {
        method: "POST",
        body: JSON.stringify({
          outletLocationId: 1,
          tableNo: newJobForm.table,
          guestType: newJobForm.guestType,
          stayId: selectedRoomGuest?.stayId ?? null,
          roomId: selectedRoomGuest?.roomId ?? null,
          customerName:
            selectedRoomGuest?.guestName ??
            newJobForm.customer.trim(),
          mobileNo: selectedRoomGuest?.mobile ?? newJobForm.mobile.trim(),
          createdByUserId: null,
        }),
      });

      await refreshRestaurant(created.jobNo);

      setNewJobForm({
        table: availableTables.filter((table) => table !== newJobForm.table)[0] ?? "T01",
        mobile: "",
        customer: "",
        guestType: "FIT",
        roomNo: "",
        outlet: outlets[0]?.name ?? "Main Restaurant",
      });

      showMessage(
        newJobForm.guestType === "Room Guest"
          ? `Room guest job ${created.jobNo} opened for Room ${selectedRoomGuest?.roomNo}.`
          : `FIT job ${created.jobNo} opened for ${newJobForm.table}.`,
        "success"
      );

      openActionPanel("bill");
    } catch (error) {
      console.error("Failed to create restaurant job", error);
      showMessage(
        error instanceof Error ? error.message : "Failed to create restaurant job.",
        "warning"
      );
    }
  }

  async function handleAddBill(e: React.FormEvent) {
    e.preventDefault();

    if (!activeJob) {
      showMessage("Select a job before adding a bill.", "warning");
      return;
    }

    if (activeJob.status === "Closed") {
      showMessage("Closed jobs cannot accept new bills.", "warning");
      return;
    }

    const qty = Number(billForm.qty);
    const unitPrice = Number(billForm.unitPrice);

    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      showMessage("Quantity and unit price must be valid positive numbers.", "warning");
      return;
    }

    if (billForm.type !== "Main Meal" && !billForm.itemName.trim()) {
      showMessage("Select or enter an item name before saving the bill.", "warning");
      return;
    }

    if (billForm.type === "Main Meal" && activeJob.guestType !== "Room Guest") {
      showMessage("Main Meal is allowed only for room guest jobs.", "warning");
      return;
    }

    try {
      await readJson(`/api/restaurant/jobs/${activeJob.dbId}/bills`, {
        method: "POST",
        body: JSON.stringify({
          billType: billForm.type,
          mealType: billForm.type === "Main Meal" ? billForm.mealType : null,
          createdByUserId: null,
          items: [
            {
              itemId:
                billForm.type === "Main Meal"
                  ? null
                  : billForm.itemId
                    ? Number(billForm.itemId)
                    : null,
              itemCategoryId: null,
              itemName:
                billForm.type === "Main Meal"
                  ? `Main Meal - ${billForm.mealType}`
                  : billForm.itemName.trim(),
              qty,
              unitPrice,
              lineAmount: qty * unitPrice,
              note: null,
            },
          ],
        }),
      });

      await refreshRestaurant(activeJob.id);

      setBillForm({
        type: activeJob.guestType === "Room Guest" ? "Main Meal" : "KOT",
        mealType: "Breakfast",
        itemId: "",
        itemName: "",
        qty: "1",
        unitPrice: "",
      });

      showMessage(`Bill saved under ${activeJob.id}.`, "success");
    } catch (error) {
      console.error("Failed to add bill", error);
      showMessage(
        error instanceof Error ? error.message : "Failed to add bill.",
        "warning"
      );
    }
  }

  async function handleApplyPayment(fullSettlement: boolean) {
    if (!activeJob) {
      showMessage("Select a job before applying payment.", "warning");
      return;
    }

    if (activeJob.guestType === "Room Guest") {
      showMessage("Room guest bills should be posted to folio instead of direct settlement here.", "warning");
      return;
    }

    const outstandingBills = activeBills.filter((bill) => bill.balance > 0 && !!bill.dbId);
    if (outstandingBills.length === 0) {
      showMessage("No outstanding FIT bill found for payment.", "warning");
      return;
    }

    try {
      if (fullSettlement) {
        if (paymentForm.target === "ALL") {
          for (const bill of outstandingBills) {
            await readJson(`/api/restaurant/bills/${bill.dbId}/pay`, {
              method: "POST",
              body: JSON.stringify({
                amount: bill.balance,
                method: paymentForm.method,
                fullSettlement: true,
              }),
            });
          }
        } else {
          const selectedBill = outstandingBills.find(
            (bill) => bill.billNo === paymentForm.target
          );

          if (!selectedBill?.dbId) {
            showMessage("Select a valid bill for settlement.", "warning");
            return;
          }

          await readJson(`/api/restaurant/bills/${selectedBill.dbId}/pay`, {
            method: "POST",
            body: JSON.stringify({
              amount: selectedBill.balance,
              method: paymentForm.method,
              fullSettlement: true,
            }),
          });
        }
      } else {
        const amount = Number(paymentForm.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
          showMessage("Enter a valid payment amount.", "warning");
          return;
        }

        if (paymentForm.target === "ALL") {
          let remainingAmount = amount;

          for (const bill of outstandingBills) {
            if (!bill.dbId || remainingAmount <= 0) {
              continue;
            }

            const appliedAmount = Math.min(remainingAmount, bill.balance);

            await readJson(`/api/restaurant/bills/${bill.dbId}/pay`, {
              method: "POST",
              body: JSON.stringify({
                amount: appliedAmount,
                method: paymentForm.method,
                fullSettlement: false,
              }),
            });

            remainingAmount -= appliedAmount;
          }

          if (remainingAmount === amount) {
            showMessage("No valid outstanding FIT bill found for partial payment.", "warning");
            return;
          }
        } else {
          const selectedBill = outstandingBills.find(
            (bill) => bill.billNo === paymentForm.target
          );

          if (!selectedBill?.dbId) {
            showMessage("Select a valid bill for payment.", "warning");
            return;
          }

          await readJson(`/api/restaurant/bills/${selectedBill.dbId}/pay`, {
            method: "POST",
            body: JSON.stringify({
              amount,
              method: paymentForm.method,
              fullSettlement: false,
            }),
          });
        }
      }

      await refreshRestaurant(activeJob.id);

      const refreshedBills = billsByJob[activeJob.id] ?? [];
      const refreshedOutstanding = refreshedBills.filter((bill) => bill.balance > 0);

      setPaymentForm({
        target: refreshedOutstanding.length === 1 ? refreshedOutstanding[0].billNo : "ALL",
        amount: "",
        method: paymentForm.method,
      });

      setActionTab("payment");
      showMessage(`FIT payment saved for ${activeJob.id}.`, "success");
    } catch (error) {
      console.error("Failed to apply FIT payment", error);
      showMessage(
        error instanceof Error ? error.message : "Failed to apply restaurant payment.",
        "warning"
      );
    }
  }

  async function handlePostToFolio() {
    if (!activeJob || activeJob.guestType !== "Room Guest") {
      showMessage("Select a room guest job before folio posting.", "warning");
      return;
    }

    const outstandingBills = activeBills.filter((bill) => bill.balance > 0 && !!bill.dbId);
    const targetBills =
      paymentForm.target === "ALL"
        ? outstandingBills
        : outstandingBills.filter((bill) => bill.billNo === paymentForm.target);

    if (targetBills.length === 0) {
      showMessage("No outstanding room-guest bill is available for folio posting.", "warning");
      return;
    }

    try {
      for (const bill of targetBills) {
        await readJson(`/api/restaurant/bills/${bill.dbId}/post-to-folio`, {
          method: "POST",
          body: JSON.stringify({
            postedByUserId: null,
            note: `Posted from job ${activeJob.id}`,
          }),
        });
      }

      await refreshRestaurant(activeJob.id);

      setPaymentForm({
        target: "ALL",
        amount: "",
        method: "Cash",
      });

      showMessage(
        `${targetBills.length} bill(s) from ${activeJob.id} posted to Room ${activeJob.roomNo} folio.`,
        "success"
      );
    } catch (error) {
      console.error("Failed to post to folio", error);
      showMessage(
        error instanceof Error ? error.message : "Failed to post room guest bill to folio.",
        "warning"
      );
    }
  }

  function focusPaymentForBill(bill: Bill) {
    setActionTab("payment");

    if (activeJob?.guestType === "Room Guest") {
      setPaymentForm({
        target: bill.billNo,
        amount: "",
        method: "Cash",
      });
      showMessage(`Posting panel prepared for ${bill.billNo}.`, "info");
    } else {
      setPaymentForm({
        target: bill.billNo,
        amount: String(bill.balance),
        method: "Cash",
      });
      showMessage(`Payment panel is prepared for ${bill.billNo}.`, "info");
    }

    requestAnimationFrame(() => {
      actionPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handlePrintBill(bill: Bill) {
    showMessage(`Print preview opened for ${bill.billNo} (demo only).`, "info");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading restaurant billing from DB API...
        </div>
      </div>
    );
  }

return (
  <AppShell
    title="Restaurant Billing"
    description="Hotel-aware outlet billing with live DB-backed job, bill, FIT payment, and room folio posting flow."
  >
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur">
        <div className="rounded-[24px] bg-black px-6 py-3 text-white shadow-sm">
          <p className="text-xl font-semibold tracking-tight">Restaurant Billing</p>
        </div>

        <div className="ml-auto grid min-w-[260px] gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Open Jobs</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{openJobsCount}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Outstanding</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{currency(outstandingTotal)}</p>
          </div>
        </div>
      </div>

{message ? (
  <div className={`rounded-3xl border px-4 py-3 text-sm ${toneClasses(message.tone)}`}>
    {message.text}
  </div>
) : null}

<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
  {[
    {
      label: "Today Sales",
      value: currency(todaySales),
      helper: "Current DB-backed billing totals",
      icon: CircleDollarSign,
    },
    {
      label: "Open Tables",
      value: String(openJobsCount),
      helper: "Jobs still active in outlets",
      icon: TableProperties,
    },
    {
      label: "Available Tables",
      value: String(availableTables.length),
      helper: `${ALL_TABLES.length} total configured tables`,
      icon: Hotel,
    },
    {
      label: "Room Guest Jobs",
      value: String(roomGuestJobs),
      helper: "Eligible for room folio posting",
      icon: Wallet,
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

<div className="w-full">
  <SelectedJobSummary
    activeJob={activeJob}
    currency={currency}
    onAddBill={() => openActionPanel("bill")}
    onTakePayment={() => {
      if (!activeJob) return;
      const outstandingBills = activeBills.filter((bill) => bill.balance > 0);
      const defaultTarget =
        outstandingBills.length === 1 ? outstandingBills[0].billNo : "ALL";

      setPaymentForm({
        target: defaultTarget,
        amount: String(activeJob.balance),
        method: "Cash",
      });
      openActionPanel("payment");
    }}
  />
</div>

<div className="flex justify-start">
  <div className="w-full max-w-[420px]">
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search by job no, table, mobile, customer"
      className="h-11 rounded-2xl border-slate-200 bg-white"
    />
  </div>
</div>

<div className="grid items-start gap-6 xl:grid-cols-[1.08fr_1fr]">
        <div className="min-w-0">
          <JobList
            filters={FILTERS}
            activeFilter={activeFilter}
            onFilterChange={(filter) => setActiveFilter(filter as (typeof FILTERS)[number])}
            filteredJobs={filteredJobs}
            activeJobId={activeJob?.id ?? null}
            onSelectJob={setActiveJobId}
          />
        </div>

        <div ref={actionPanelRef} className="min-w-0">
          <FrontDeskActionsPanel
            actionTab={actionTab}
            setActionTab={setActionTab}
            activeJob={activeJob}
            activeBills={activeBills.map((bill) => ({
              billNo: bill.billNo,
              balance: bill.balance,
            }))}
            availableTables={availableTables}
            outletOptions={outlets.map((item) => item.name)}
            roomGuestOptions={roomGuestOptions}
            itemOptions={itemOptions}
            newJobForm={newJobForm}
            setNewJobForm={setNewJobForm}
            onCreateJob={handleCreateJob}
            billForm={billForm}
            setBillForm={setBillForm}
            onAddBill={handleAddBill}
            paymentForm={paymentForm}
            setPaymentForm={setPaymentForm}
            onApplyPayment={handleApplyPayment}
            onPostToFolio={handlePostToFolio}
            currency={currency}
          />
        </div>
      </div>

      <div className="w-full">
        <BillList
          activeJob={activeJob}
          activeBills={activeBills}
          currency={currency}
          onNewKOTBill={() => {
            setBillForm((prev) => ({ ...prev, type: "KOT" }));
            openActionPanel("bill");
          }}
          onNewBOTBill={() => {
            setBillForm((prev) => ({ ...prev, type: "BOT" }));
            openActionPanel("bill");
          }}
          onNewMainMealBill={() => {
            setBillForm((prev) => ({ ...prev, type: "Main Meal" }));
            openActionPanel("bill");
          }}
          onPrintBill={handlePrintBill}
          onPayBill={focusPaymentForBill}
        />
      </div>
    </div>
  </AppShell>
);
}
