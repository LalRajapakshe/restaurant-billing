"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  CircleDollarSign,
  Hotel,
  Plus,
  ReceiptText,
  TableProperties,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

import BillList from "@/components/frontdesk/bill-list";
import FrontDeskActionsPanel from "@/components/frontdesk/frontdesk-actions-panel";
import JobList from "@/components/frontdesk/job-list";
import SelectedJobSummary from "@/components/frontdesk/selected-job-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockOutlets } from "@/data/mock-outlets";
import { mockRooms } from "@/data/mock-rooms";
import { GuestType, MealType, OutletRecord, RestaurantBillType } from "@/types/restaurant";

type JobStatus = "Open" | "Partially Paid" | "Ready to Close" | "Closed";
type MessageTone = "success" | "warning" | "info";
type ActionTab = "job" | "bill" | "payment";

type BillItem = {
  name: string;
  qty: number;
  amount: number;
};

type Bill = {
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
  items: BillItem[];
};

type Job = {
  id: string;
  table: string;
  mobile: string;
  customer: string;
  openedAt: string;
  isClosed: boolean;
  guestType: GuestType;
  roomNo?: string;
  outlet: string;
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

const ALL_TABLES = [
  "T01",
  "T02",
  "T03",
  "T04",
  "T05",
  "T06",
  "T07",
  "T08",
  "T09",
  "T10",
  "T11",
  "T12",
  "VIP-01",
  "VIP-02",
];

const INITIAL_JOBS: Job[] = [
  {
    id: "JOB-24031",
    table: "T03",
    mobile: "077 334 2211",
    customer: "Walk-in / Silva",
    openedAt: "12:22 PM",
    isClosed: false,
    guestType: "FIT",
    outlet: "Main Restaurant",
  },
  {
    id: "JOB-24032",
    table: "T07",
    mobile: "071 885 9014",
    customer: "Pool Guest / Rashan",
    openedAt: "12:40 PM",
    isClosed: false,
    guestType: "FIT",
    outlet: "Pool Bar",
  },
  {
    id: "JOB-24033",
    table: "T11",
    mobile: "078 455 3390",
    customer: "Fernando Family",
    openedAt: "1:05 PM",
    isClosed: false,
    guestType: "Room Guest",
    roomNo: "118",
    outlet: "Main Restaurant",
  },
  {
    id: "JOB-24034",
    table: "VIP-01",
    mobile: "075 903 4412",
    customer: "Lanka Travels Group",
    openedAt: "1:18 PM",
    isClosed: false,
    guestType: "Room Guest",
    roomNo: "301",
    outlet: "Main Restaurant",
  },
];

const INITIAL_BILLS: Record<string, Bill[]> = {
  "JOB-24031": [
    {
      billNo: "BILL-92001",
      type: "KOT",
      guestType: "FIT",
      outlet: "Main Restaurant",
      amount: 8350,
      paid: 5000,
      balance: 3350,
      createdAt: "12:30 PM",
      items: [
        { name: "Chicken Fried Rice", qty: 2, amount: 2400 },
        { name: "Devilled Chicken", qty: 1, amount: 1900 },
        { name: "VAT + Service", qty: 1, amount: 4050 },
      ],
    },
  ],
  "JOB-24032": [
    {
      billNo: "BILL-92005",
      type: "BOT",
      guestType: "FIT",
      outlet: "Pool Bar",
      amount: 5200,
      paid: 0,
      balance: 5200,
      createdAt: "12:48 PM",
      items: [
        { name: "Mocktail", qty: 2, amount: 1800 },
        { name: "Milkshake", qty: 2, amount: 1600 },
        { name: "Snacks", qty: 1, amount: 1800 },
      ],
    },
  ],
  "JOB-24033": [
    {
      billNo: "BILL-92011",
      type: "Main Meal",
      mealType: "Lunch",
      guestType: "Room Guest",
      outlet: "Main Restaurant",
      roomNo: "118",
      amount: 6200,
      paid: 0,
      balance: 6200,
      createdAt: "1:12 PM",
      items: [
        { name: "Main Meal - Lunch", qty: 2, amount: 6200 },
      ],
    },
    {
      billNo: "BILL-92012",
      type: "BOT",
      guestType: "Room Guest",
      outlet: "Main Restaurant",
      roomNo: "118",
      amount: 2800,
      paid: 0,
      balance: 2800,
      createdAt: "1:25 PM",
      items: [
        { name: "Fresh Juice", qty: 2, amount: 1800 },
        { name: "Dessert", qty: 1, amount: 1000 },
      ],
    },
  ],
  "JOB-24034": [
    {
      billNo: "BILL-92015",
      type: "KOT",
      guestType: "Room Guest",
      outlet: "Main Restaurant",
      roomNo: "301",
      amount: 9400,
      paid: 0,
      balance: 9400,
      createdAt: "1:32 PM",
      items: [
        { name: "Party Set Menu", qty: 1, amount: 7600 },
        { name: "VAT + Service", qty: 1, amount: 1800 },
      ],
    },
  ],
};

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

function currentTimeLabel() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
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

function fireAndForget(url: string, payload: unknown) {
  void fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}

export default function RestaurantBillingFrontDeskPage() {
  const [actionTab, setActionTab] = useState<ActionTab>("bill");
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("All");
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [billsByJob, setBillsByJob] = useState<Record<string, Bill[]>>(INITIAL_BILLS);
  const [activeJobId, setActiveJobId] = useState<string>("JOB-24031");
  const [outlets, setOutlets] = useState<OutletRecord[]>(mockOutlets);
  const [message, setMessage] = useState<{ tone: MessageTone; text: string } | null>({
    tone: "info",
    text: "Restaurant billing is now hotel-aware. FIT guests settle directly, while room guests can be posted to folio with Main Meal support.",
  });

  const jobCounterRef = useRef(24034);
  const billCounterRef = useRef(92015);
  const actionPanelRef = useRef<HTMLDivElement | null>(null);

  const roomGuestOptions = useMemo(() => {
    return mockRooms
      .filter((room) => room.status === "Occupied")
      .map((room) => ({
        roomNo: room.roomNo,
        guestName: room.guestName,
        mobile: room.mobile,
        boardBasis: room.boardBasis,
      }));
  }, []);

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
    itemName: "",
    qty: "1",
    unitPrice: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    target: "ALL",
    amount: "",
    method: "Cash" as "Cash" | "Card" | "Transfer",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadOutlets() {
      try {
        const response = await fetch("/api/outlets", { cache: "no-store" });
        if (!response.ok) throw new Error("Outlet API failed");
        const json = await response.json();
        const nextOutlets = Array.isArray(json?.data) ? (json.data as OutletRecord[]) : mockOutlets;

        if (!isMounted) return;
        setOutlets(nextOutlets);
        setNewJobForm((prev) => ({
          ...prev,
          outlet: prev.outlet || nextOutlets[0]?.name || "Main Restaurant",
        }));
      } catch {
        if (!isMounted) return;
        setOutlets(mockOutlets);
      }
    }

    loadOutlets();

    return () => {
      isMounted = false;
    };
  }, []);

  const jobsView = useMemo<JobView[]>(() => {
    return jobs.map((job) => {
      const metrics = computeJobMetrics(job, billsByJob[job.id] ?? []);
      return { ...job, ...metrics };
    });
  }, [jobs, billsByJob]);

  const activeJob = jobsView.find((job) => job.id === activeJobId) ?? jobsView[0] ?? null;
  const activeBills = activeJob ? billsByJob[activeJob.id] ?? [] : [];

  const availableTables = useMemo(() => {
    const occupied = new Set(jobsView.filter((job) => job.status !== "Closed").map((job) => job.table));
    return ALL_TABLES.filter((table) => !occupied.has(table));
  }, [jobsView]);

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

  const filteredJobs = useMemo(() => {
    return jobsView.filter((job) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "FIT" || activeFilter === "Room Guest") {
        return job.guestType === activeFilter;
      }
      return job.status === activeFilter;
    });
  }, [jobsView, activeFilter]);

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

  function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();

    if (!newJobForm.table) {
      showMessage("No available table found for a new restaurant job.", "warning");
      return;
    }

    if (newJobForm.guestType === "Room Guest" && !newJobForm.roomNo) {
      showMessage("Select an occupied room for room guest billing.", "warning");
      return;
    }

    if (newJobForm.guestType === "FIT" && !newJobForm.customer.trim()) {
      showMessage("Customer name is required for FIT / outside guest jobs.", "warning");
      return;
    }

    jobCounterRef.current += 1;
    const nextJobId = `JOB-${jobCounterRef.current}`;

    const roomGuest = roomGuestOptions.find((item) => item.roomNo === newJobForm.roomNo);

    const newJob: Job = {
      id: nextJobId,
      table: newJobForm.table,
      mobile:
        newJobForm.guestType === "Room Guest"
          ? roomGuest?.mobile ?? newJobForm.mobile.trim()
          : newJobForm.mobile.trim(),
      customer:
        newJobForm.guestType === "Room Guest"
          ? roomGuest?.guestName ?? newJobForm.customer.trim()
          : newJobForm.customer.trim(),
      openedAt: currentTimeLabel(),
      isClosed: false,
      guestType: newJobForm.guestType,
      roomNo: newJobForm.guestType === "Room Guest" ? newJobForm.roomNo : "",
      outlet: newJobForm.outlet,
    };

    const nextTable = availableTables.filter((table) => table !== newJobForm.table)[0] ?? "";

    setJobs((prev) => [newJob, ...prev]);
    setBillsByJob((prev) => ({ ...prev, [nextJobId]: [] }));
    setActiveJobId(nextJobId);
    setActionTab("bill");
    setBillForm({
      type: "KOT",
      mealType: "Breakfast",
      itemName: "",
      qty: "1",
      unitPrice: "",
    });
    setNewJobForm({
      table: nextTable,
      mobile: "",
      customer: "",
      guestType: "FIT",
      roomNo: "",
      outlet: outlets[0]?.name ?? "Main Restaurant",
    });

    showMessage(
      newJob.guestType === "Room Guest"
        ? `Room guest job ${nextJobId} opened for Room ${newJob.roomNo}.`
        : `FIT job ${nextJobId} opened for ${newJob.table}.`,
      "success"
    );
  }

  function handleAddBill(e: React.FormEvent) {
    e.preventDefault();

    if (!activeJob) {
      showMessage("Select a job before adding a bill.", "warning");
      return;
    }

    if (activeJob.status === "Closed") {
      showMessage("Closed jobs cannot accept new bills.", "warning");
      return;
    }

    if (billForm.type === "Main Meal" && activeJob.guestType !== "Room Guest") {
      showMessage("Main Meal is allowed only for in-house room guests.", "warning");
      return;
    }

    if (billForm.type === "Main Meal" && !billForm.mealType) {
      showMessage("Choose a meal type for Main Meal posting.", "warning");
      return;
    }

    const qty = Number(billForm.qty);
    const unitPrice = Number(billForm.unitPrice);

    if (billForm.type !== "Main Meal" && !billForm.itemName.trim()) {
      showMessage("Enter an item name for the bill.", "warning");
      return;
    }

    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      showMessage("Quantity and unit price must be valid positive numbers.", "warning");
      return;
    }

    billCounterRef.current += 1;
    const nextBillNo = `BILL-${billCounterRef.current}`;
    const amount = qty * unitPrice;

    const resolvedItemName =
      billForm.type === "Main Meal"
        ? `Main Meal - ${billForm.mealType}`
        : billForm.itemName.trim();

    const newBill: Bill = {
      billNo: nextBillNo,
      type: billForm.type,
      mealType: billForm.type === "Main Meal" ? billForm.mealType : null,
      guestType: activeJob.guestType,
      outlet: activeJob.outlet,
      roomNo: activeJob.roomNo,
      amount,
      paid: 0,
      balance: amount,
      createdAt: currentTimeLabel(),
      items: [
        {
          name: resolvedItemName,
          qty,
          amount,
        },
      ],
    };

    setBillsByJob((prev) => ({
      ...prev,
      [activeJob.id]: [newBill, ...(prev[activeJob.id] ?? [])],
    }));

    setBillForm({
      type: activeJob.guestType === "Room Guest" ? "Main Meal" : "KOT",
      mealType: "Breakfast",
      itemName: "",
      qty: "1",
      unitPrice: "",
    });

    showMessage(
      activeJob.guestType === "Room Guest"
        ? `${newBill.type} bill ${nextBillNo} added and prepared for room folio posting.`
        : `${newBill.type} bill ${nextBillNo} added for direct restaurant settlement.`,
      "success"
    );
  }

  function distributePayment(sourceBills: Bill[], requestedAmount: number, target: string) {
    let remaining = requestedAmount;
    let applied = 0;

    const updatedBills = sourceBills.map((bill) => {
      if (remaining <= 0) return bill;
      if (bill.balance <= 0) return bill;
      if (target !== "ALL" && bill.billNo !== target) return bill;

      const appliedToBill = Math.min(bill.balance, remaining);
      remaining -= appliedToBill;
      applied += appliedToBill;

      return {
        ...bill,
        paid: bill.paid + appliedToBill,
        balance: bill.balance - appliedToBill,
      };
    });

    return { updatedBills, applied };
  }

  function handleApplyPayment(fullSettlement: boolean) {
    if (!activeJob) {
      showMessage("Select a job before applying payment.", "warning");
      return;
    }

    if (activeJob.guestType === "Room Guest") {
      showMessage("Room guest bills should be posted to room folio instead of direct settlement here.", "warning");
      return;
    }

    if (activeBills.length === 0) {
      showMessage("There are no bills under the selected job.", "warning");
      return;
    }

    const outstanding = activeJob.balance;
    const requestedAmount = fullSettlement ? outstanding : Number(paymentForm.amount);

    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      showMessage("Enter a valid payment amount.", "warning");
      return;
    }

    const { updatedBills, applied } = distributePayment(activeBills, requestedAmount, paymentForm.target);

    if (applied <= 0) {
      showMessage("No payment could be applied to the selected target bill.", "warning");
      return;
    }

    const newBalance = updatedBills.reduce((sum, bill) => sum + bill.balance, 0);
    const shouldClose = newBalance === 0 && updatedBills.length > 0;

    setBillsByJob((prev) => ({
      ...prev,
      [activeJob.id]: updatedBills,
    }));

    setJobs((prev) =>
      prev.map((job) => (job.id === activeJob.id ? { ...job, isClosed: shouldClose } : job))
    );

    setPaymentForm({
      target: "ALL",
      amount: shouldClose ? "" : String(newBalance),
      method: paymentForm.method,
    });

    if (shouldClose) {
      showMessage(
        `${currency(applied)} received via ${paymentForm.method}. ${activeJob.id} is fully settled and ${activeJob.table} is now available.`,
        "success"
      );
      setActionTab("job");
    } else {
      showMessage(
        `${currency(applied)} received via ${paymentForm.method}. Remaining balance for ${activeJob.id} is ${currency(newBalance)}.`,
        "success"
      );
    }
  }

  function handlePostToFolio() {
    if (!activeJob) {
      showMessage("Select a room guest job before folio posting.", "warning");
      return;
    }

    if (activeJob.guestType !== "Room Guest") {
      showMessage("Only room guest jobs can be posted to folio.", "warning");
      return;
    }

    if (!activeJob.roomNo) {
      showMessage("Room reference is missing for folio posting.", "warning");
      return;
    }

    if (activeJob.balance <= 0) {
      showMessage("This job has no outstanding amount to post.", "warning");
      return;
    }

    const updatedBills = activeBills.map((bill) => ({
      ...bill,
      paid: bill.amount,
      balance: 0,
    }));

    setBillsByJob((prev) => ({
      ...prev,
      [activeJob.id]: updatedBills,
    }));

    setJobs((prev) =>
      prev.map((job) =>
        job.id === activeJob.id
          ? {
              ...job,
              isClosed: true,
            }
          : job
      )
    );

    fireAndForget("/api/folio-postings", {
      roomNo: activeJob.roomNo,
      guestName: activeJob.customer,
      outlet: activeJob.outlet,
      sourceJobId: activeJob.id,
      amount: activeJob.balance,
      billingType: updatedBills[0]?.type ?? "KOT",
      mealType: updatedBills.find((bill) => bill.type === "Main Meal")?.mealType ?? null,
    });

    showMessage(
      `${activeJob.id} posted to Room ${activeJob.roomNo} folio. Table ${activeJob.table} is available again.`,
      "success"
    );
    setActionTab("job");
  }

  function focusPaymentForBill(bill: Bill) {
    setActionTab("payment");

    if (activeJob?.guestType === "Room Guest") {
      showMessage(`Posting panel prepared for room folio posting from ${bill.billNo}.`, "info");
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

  function demoPrintBill(bill: Bill) {
    showMessage(`Print preview opened for ${bill.billNo} (demo only).`, "info");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-[32px] border border-white/70 bg-slate-900 text-white shadow-2xl">
          <div className="grid gap-6 p-6 md:grid-cols-[1.3fr_0.7fr] md:p-8">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge className="rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/10">
                  Restaurant Billing
                </Badge>
                <Badge className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-emerald-200">
                  Sprint 4 Hotel Integration
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Hotel-Aware Outlet Billing
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Existing restaurant billing now supports FIT guests, room guests, multiple outlets, and Main Meal posting to room folio.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  className="rounded-2xl bg-white text-slate-900 hover:bg-slate-100"
                  onClick={() => openActionPanel("job")}
                >
                  <Plus className="mr-2 h-4 w-4" /> Open New Job
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  onClick={() => openActionPanel("bill")}
                >
                  <ReceiptText className="mr-2 h-4 w-4" /> New Bill Under Job
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 self-end">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Open Jobs</p>
                <p className="mt-3 text-3xl font-semibold">{openJobsCount}</p>
                <p className="mt-1 text-sm text-slate-400">{roomGuestJobs} room guest jobs</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Outstanding</p>
                <p className="mt-3 text-3xl font-semibold">{currency(outstandingTotal)}</p>
                <p className="mt-1 text-sm text-slate-400">{outlets.length} outlets configured</p>
              </div>
            </div>
          </div>
        </div>

        {message ? (
          <div className={`mb-6 rounded-3xl border px-4 py-3 text-sm ${toneClasses(message.tone)}`}>
            {message.text}
          </div>
        ) : null}

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Today Sales",
              value: currency(todaySales),
              helper: "All outlet billing totals in demo",
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

        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr_0.95fr]">
          <JobList
            filters={FILTERS}
            activeFilter={activeFilter}
            onFilterChange={(filter) => setActiveFilter(filter as (typeof FILTERS)[number])}
            filteredJobs={filteredJobs}
            activeJobId={activeJob?.id ?? null}
            onSelectJob={setActiveJobId}
          />

          <div className="space-y-6">
            <SelectedJobSummary
              activeJob={activeJob}
              currency={currency}
              onAddBill={() => openActionPanel("bill")}
              onTakePayment={() => openActionPanel("payment")}
            />

            <BillList
              activeJob={
                activeJob
                  ? {
                      status: activeJob.status,
                      guestType: activeJob.guestType,
                      roomNo: activeJob.roomNo,
                      outlet: activeJob.outlet,
                    }
                  : null
              }
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
                setBillForm((prev) => ({ ...prev, type: "Main Meal", mealType: "Breakfast" }));
                openActionPanel("bill");
              }}
              onPrintBill={demoPrintBill}
              onPayBill={focusPaymentForBill}
            />
          </div>

          <div className="space-y-6">
            <div ref={actionPanelRef}>
              <FrontDeskActionsPanel
                actionTab={actionTab}
                setActionTab={setActionTab}
                activeJob={
                  activeJob
                    ? {
                        id: activeJob.id,
                        table: activeJob.table,
                        customer: activeJob.customer,
                        balance: activeJob.balance,
                        bills: activeJob.bills,
                        status: activeJob.status,
                        guestType: activeJob.guestType,
                        roomNo: activeJob.roomNo,
                        outlet: activeJob.outlet,
                      }
                    : null
                }
                activeBills={activeBills.map((bill) => ({
                  billNo: bill.billNo,
                  balance: bill.balance,
                }))}
                availableTables={availableTables}
                outletOptions={outlets.map((item) => item.name)}
                roomGuestOptions={roomGuestOptions}
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

            <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl">Outlet / Income Centers</CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Billing now supports more than one outlet within the same property.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {outlets.map((outlet) => (
                  <div key={outlet.id} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                    <div>
                      <p className="font-medium text-slate-900">{outlet.name}</p>
                      <p className="text-sm text-slate-500">{outlet.category}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                      <Building2 className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl">Hotel Restaurant Rules</CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Sprint 4 behavior added on top of the existing restaurant interface.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4">
                  <UtensilsCrossed className="mt-0.5 h-4 w-4 text-slate-700" />
                  <div>
                    <p className="font-medium text-slate-900">Main Meal</p>
                    <p>Breakfast, Lunch, Dinner, and A la carte are enabled only for in-house room guests.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4">
                  <Wallet className="mt-0.5 h-4 w-4 text-slate-700" />
                  <div>
                    <p className="font-medium text-slate-900">Room Folio Posting</p>
                    <p>Room guest restaurant bills are landed to room folio instead of direct outlet settlement.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4">
                  <ReceiptText className="mt-0.5 h-4 w-4 text-slate-700" />
                  <div>
                    <p className="font-medium text-slate-900">FIT vs Room Guest</p>
                    <p>FIT guests settle at restaurant. Room guests carry room reference and folio-ready posting flow.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
