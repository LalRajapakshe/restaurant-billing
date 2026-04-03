"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ChefHat,
    CircleDollarSign,
    Clock3,
    CreditCard,
    Filter,
    Landmark,
    LayoutDashboard,
    Package,
    Phone,
    Plus,
    ReceiptText,
    Search,
    Sparkles,
    TableProperties,
    UtensilsCrossed,
    Wallet,
    Wine,
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BillType = "KOT" | "BOT";
type PaymentMethod = "Cash" | "Card" | "Transfer";
type JobStatus = "Open" | "Partially Paid" | "Ready to Close" | "Closed";
type MessageTone = "success" | "warning" | "info";

type BillItem = {
    name: string;
    qty: number;
    amount: number;
};

type Bill = {
    billNo: string;
    type: BillType;
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
};

type JobMetrics = {
    bills: number;
    typeMix: BillType[];
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
    "T13",
    "T14",
    "T15",
    "T16",
    "VIP-01",
    "VIP-02",
    "VIP-03",
    "VIP-04",
];

const INITIAL_JOBS: Job[] = [
    {
        id: "JOB-24031",
        table: "T03",
        mobile: "077 334 2211",
        customer: "Walk-in / Silva",
        openedAt: "12:22 PM",
        isClosed: false,
    },
    {
        id: "JOB-24032",
        table: "T07",
        mobile: "071 885 9014",
        customer: "Perera Family",
        openedAt: "12:40 PM",
        isClosed: false,
    },
    {
        id: "JOB-24033",
        table: "T11",
        mobile: "076 120 4533",
        customer: "Corporate Lunch",
        openedAt: "1:05 PM",
        isClosed: false,
    },
    {
        id: "JOB-24034",
        table: "T15",
        mobile: "078 455 3390",
        customer: "Fernando",
        openedAt: "1:18 PM",
        isClosed: false,
    },
    {
        id: "JOB-24035",
        table: "VIP-02",
        mobile: "075 903 4412",
        customer: "Birthday Party",
        openedAt: "1:32 PM",
        isClosed: false,
    },
    {
        id: "JOB-24036",
        table: "T05",
        mobile: "070 112 9922",
        customer: "Nimal Group",
        openedAt: "1:44 PM",
        isClosed: false,
    },
];

const INITIAL_BILLS: Record<string, Bill[]> = {
    "JOB-24031": [
        {
            billNo: "BILL-90121",
            type: "KOT",
            amount: 8350,
            paid: 7000,
            balance: 1350,
            createdAt: "12:30 PM",
            items: [
                { name: "Chicken Fried Rice", qty: 2, amount: 2400 },
                { name: "Devilled Chicken", qty: 1, amount: 1900 },
                { name: "Mineral Water", qty: 4, amount: 800 },
                { name: "VAT + Service", qty: 1, amount: 3250 },
            ],
        },
        {
            billNo: "BILL-90128",
            type: "BOT",
            amount: 4500,
            paid: 2000,
            balance: 2500,
            createdAt: "12:45 PM",
            items: [
                { name: "Fresh Lime", qty: 2, amount: 1200 },
                { name: "Mojito", qty: 2, amount: 2200 },
                { name: "Ice Cream", qty: 1, amount: 1100 },
            ],
        },
    ],
    "JOB-24032": [
        {
            billNo: "BILL-90131",
            type: "KOT",
            amount: 6400,
            paid: 0,
            balance: 6400,
            createdAt: "12:50 PM",
            items: [
                { name: "Seafood Nasi Goreng", qty: 2, amount: 3600 },
                { name: "Coke", qty: 2, amount: 800 },
                { name: "VAT + Service", qty: 1, amount: 2000 },
            ],
        },
    ],
    "JOB-24033": [
        {
            billNo: "BILL-90135",
            type: "KOT",
            amount: 9400,
            paid: 9400,
            balance: 0,
            createdAt: "1:10 PM",
            items: [
                { name: "Lunch Buffet", qty: 4, amount: 7600 },
                { name: "VAT + Service", qty: 1, amount: 1800 },
            ],
        },
        {
            billNo: "BILL-90136",
            type: "BOT",
            amount: 5300,
            paid: 5000,
            balance: 300,
            createdAt: "1:18 PM",
            items: [
                { name: "Fresh Juice", qty: 5, amount: 3500 },
                { name: "Dessert", qty: 2, amount: 1800 },
            ],
        },
        {
            billNo: "BILL-90137",
            type: "KOT",
            amount: 7400,
            paid: 7400,
            balance: 0,
            createdAt: "1:25 PM",
            items: [
                { name: "Grilled Fish", qty: 2, amount: 5200 },
                { name: "Rice", qty: 2, amount: 1200 },
                { name: "VAT + Service", qty: 1, amount: 1000 },
            ],
        },
    ],
    "JOB-24034": [
        {
            billNo: "BILL-90139",
            type: "BOT",
            amount: 5200,
            paid: 1500,
            balance: 3700,
            createdAt: "1:28 PM",
            items: [
                { name: "Milkshake", qty: 3, amount: 2100 },
                { name: "Mocktail", qty: 2, amount: 1800 },
                { name: "Snacks", qty: 1, amount: 1300 },
            ],
        },
    ],
    "JOB-24035": [
        {
            billNo: "BILL-90141",
            type: "KOT",
            amount: 26500,
            paid: 18000,
            balance: 8500,
            createdAt: "1:36 PM",
            items: [
                { name: "Party Set Menu", qty: 1, amount: 18000 },
                { name: "Extra Portions", qty: 5, amount: 4500 },
                { name: "VAT + Service", qty: 1, amount: 4000 },
            ],
        },
        {
            billNo: "BILL-90142",
            type: "BOT",
            amount: 11400,
            paid: 8000,
            balance: 3400,
            createdAt: "1:40 PM",
            items: [
                { name: "Signature Mocktails", qty: 6, amount: 5400 },
                { name: "Fresh Juice", qty: 4, amount: 2400 },
                { name: "Dessert Shots", qty: 6, amount: 3600 },
            ],
        },
        {
            billNo: "BILL-90143",
            type: "KOT",
            amount: 6200,
            paid: 4000,
            balance: 2200,
            createdAt: "1:42 PM",
            items: [
                { name: "Kids Meal", qty: 4, amount: 4800 },
                { name: "Ice Cream", qty: 4, amount: 1400 },
            ],
        },
        {
            billNo: "BILL-90144",
            type: "BOT",
            amount: 4500,
            paid: 0,
            balance: 4500,
            createdAt: "1:45 PM",
            items: [
                { name: "Coffee", qty: 10, amount: 3000 },
                { name: "Tea", qty: 5, amount: 1500 },
            ],
        },
    ],
    "JOB-24036": [
        {
            billNo: "BILL-90145",
            type: "KOT",
            amount: 3900,
            paid: 0,
            balance: 3900,
            createdAt: "1:46 PM",
            items: [
                { name: "String Hopper Kottu", qty: 2, amount: 2200 },
                { name: "Lime Juice", qty: 2, amount: 1000 },
                { name: "VAT + Service", qty: 1, amount: 700 },
            ],
        },
    ],
};

const FILTERS = ["All", "Open", "Partially Paid", "Ready to Close", "Closed"] as const;

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

function statusClasses(status: JobStatus) {
    if (status === "Closed") {
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (status === "Ready to Close") {
        return "bg-teal-50 text-teal-700 border-teal-200";
    }
    if (status === "Partially Paid") {
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
}

function toneClasses(tone: MessageTone) {
    if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
    if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-800";
    return "border-sky-200 bg-sky-50 text-sky-800";
}

function BillTypeBadge({ type }: { type: BillType }) {
    const isKot = type === "KOT";
    return (
        <Badge className={isKot ? "bg-teal-600 hover:bg-teal-600" : "bg-violet-600 hover:bg-violet-600"}>
            {isKot ? <ChefHat className="mr-1 h-3.5 w-3.5" /> : <Wine className="mr-1 h-3.5 w-3.5" />}
            {type}
        </Badge>
    );
}

function SummaryCard({
    label,
    value,
    change,
    icon: Icon,
    index,
}: {
    label: string;
    value: string;
    change: string;
    icon: React.ComponentType<{ className?: string }>;
    index: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className="border-white/70 bg-white/90 shadow-sm backdrop-blur">
                <CardContent className="flex items-start justify-between p-5">
                    <div>
                        <p className="text-sm text-slate-500">{label}</p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
                        <p className="mt-1 text-xs text-slate-500">{change}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                        <Icon className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function JobCard({
    job,
    active,
    onSelect,
}: {
    job: JobView;
    active: boolean;
    onSelect: () => void;
}) {
    const progress = job.subtotal > 0 ? Math.round((job.paid / job.subtotal) * 100) : 0;

    return (
        <motion.button
            whileHover={{ y: -2 }}
            onClick={onSelect}
            className={`w-full rounded-3xl border p-4 text-left shadow-sm transition ${active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white hover:border-slate-300"
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${active ? "border-white/15 bg-white/10 text-white" : statusClasses(job.status)
                                }`}
                        >
                            {job.status}
                        </span>
                        <span className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>{job.id}</span>
                    </div>
                    <h3 className={`mt-3 text-lg font-semibold ${active ? "text-white" : "text-slate-900"}`}>
                        {job.table}
                    </h3>
                    <p className={`text-sm ${active ? "text-slate-300" : "text-slate-500"}`}>{job.customer}</p>
                </div>
                <div className={`rounded-2xl px-3 py-2 text-right ${active ? "bg-white/10" : "bg-slate-50"}`}>
                    <p className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>Balance</p>
                    <p className={`text-base font-semibold ${active ? "text-white" : "text-slate-900"}`}>
                        {currency(job.balance)}
                    </p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                    <p className={active ? "text-slate-400" : "text-slate-500"}>Bills</p>
                    <p className={`mt-1 font-medium ${active ? "text-white" : "text-slate-900"}`}>{job.bills}</p>
                </div>
                <div>
                    <p className={active ? "text-slate-400" : "text-slate-500"}>Opened</p>
                    <p className={`mt-1 font-medium ${active ? "text-white" : "text-slate-900"}`}>{job.openedAt}</p>
                </div>
                <div>
                    <p className={active ? "text-slate-400" : "text-slate-500"}>Mobile</p>
                    <p className={`mt-1 font-medium ${active ? "text-white" : "text-slate-900"}`}>{job.mobile}</p>
                </div>
            </div>

            <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                    <span className={active ? "text-slate-300" : "text-slate-500"}>Settlement progress</span>
                    <span className={active ? "text-white" : "text-slate-700"}>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {job.typeMix.length > 0 ? (
                    job.typeMix.map((type) => <BillTypeBadge key={`${job.id}-${type}`} type={type} />)
                ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        No bills yet
                    </Badge>
                )}
            </div>
        </motion.button>
    );
}

export default function RestaurantBillingFrontDeskPage() {
    const [activeTab, setActiveTab] = useState("frontdesk");
    const [actionTab, setActionTab] = useState("payment");
    const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("All");
    const [search, setSearch] = useState("");
    const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
    const [billsByJob, setBillsByJob] = useState<Record<string, Bill[]>>(INITIAL_BILLS);
    const [activeJobId, setActiveJobId] = useState<string>("JOB-24031");
    const [message, setMessage] = useState<{ tone: MessageTone; text: string } | null>({
        tone: "info",
        text: "Demo mode is live. Open jobs, add KOT/BOT bills, apply payments, and watch jobs auto-close when the balance becomes zero.",
    });

    const jobCounterRef = useRef(24036);
    const billCounterRef = useRef(90145);
    const actionPanelRef = useRef<HTMLDivElement | null>(null);

    const [newJobForm, setNewJobForm] = useState({
        table: "T01",
        mobile: "",
        customer: "Walk-in Customer",
    });

    const [billForm, setBillForm] = useState({
        type: "KOT" as BillType,
        itemName: "",
        qty: "1",
        unitPrice: "",
    });

    const [paymentForm, setPaymentForm] = useState({
        target: "ALL",
        amount: "",
        method: "Cash" as PaymentMethod,
    });

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
            const matchesFilter = activeFilter === "All" ? true : job.status === activeFilter;
            const q = search.trim().toLowerCase();

            const matchesSearch =
                !q ||
                job.id.toLowerCase().includes(q) ||
                job.table.toLowerCase().includes(q) ||
                job.mobile.toLowerCase().includes(q) ||
                job.customer.toLowerCase().includes(q);

            return matchesFilter && matchesSearch;
        });
    }, [jobsView, activeFilter, search]);

    const openJobsCount = jobsView.filter((job) => job.status !== "Closed").length;
    const closedJobsCount = jobsView.filter((job) => job.status === "Closed").length;
    const todaySales = jobsView.reduce((sum, job) => sum + job.subtotal, 0);
    const paidTotal = jobsView.reduce((sum, job) => sum + job.paid, 0);
    const outstandingTotal = jobsView.reduce((sum, job) => sum + job.balance, 0);

    const allBills = useMemo(() => Object.values(billsByJob).flat(), [billsByJob]);

    const kotTotal = allBills
        .filter((bill) => bill.type === "KOT")
        .reduce((sum, bill) => sum + bill.amount, 0);

    const botTotal = allBills
        .filter((bill) => bill.type === "BOT")
        .reduce((sum, bill) => sum + bill.amount, 0);

    const summaryCards = [
        {
            label: "Today Sales",
            value: currency(todaySales),
            change: `${allBills.length} bills in demo`,
            icon: CircleDollarSign,
        },
        {
            label: "Open Jobs",
            value: String(openJobsCount),
            change: `${closedJobsCount} closed`,
            icon: ReceiptText,
        },
        {
            label: "Available Tables",
            value: String(availableTables.length),
            change: `${ALL_TABLES.length} total tables`,
            icon: TableProperties,
        },
        {
            label: "BOT Sales",
            value: currency(botTotal),
            change: `${todaySales > 0 ? ((botTotal / todaySales) * 100).toFixed(1) : "0"}% of today`,
            icon: Wine,
        },
    ];

    const billingSplit = [
        { name: "KOT", value: kotTotal, color: "#0f766e" },
        { name: "BOT", value: botTotal, color: "#7c3aed" },
    ];

    const tableActivity = [
        {
            name: "T01-T08",
            value: jobsView.filter(
                (job) =>
                    !job.isClosed &&
                    ["T01", "T02", "T03", "T04", "T05", "T06", "T07", "T08"].includes(job.table)
            ).length,
        },
        {
            name: "T09-T16",
            value: jobsView.filter(
                (job) =>
                    !job.isClosed &&
                    ["T09", "T10", "T11", "T12", "T13", "T14", "T15", "T16"].includes(job.table)
            ).length,
        },
        {
            name: "VIP",
            value: jobsView.filter((job) => !job.isClosed && job.table.startsWith("VIP")).length,
        },
    ];

    const salesTrend = [
        { hour: "10AM", sales: Math.round(todaySales * 0.08) },
        { hour: "11AM", sales: Math.round(todaySales * 0.13) },
        { hour: "12PM", sales: Math.round(todaySales * 0.18) },
        { hour: "1PM", sales: Math.round(todaySales * 0.22) },
        { hour: "2PM", sales: Math.round(todaySales * 0.12) },
        { hour: "3PM", sales: Math.round(todaySales * 0.1) },
        { hour: "4PM", sales: Math.round(todaySales * 0.12) },
        { hour: "5PM", sales: Math.round(todaySales * 0.16) },
        { hour: "6PM", sales: Math.round(todaySales * 0.2) },
    ];

    function showMessage(text: string, tone: MessageTone = "success") {
        setMessage({ text, tone });
    }

    function handleCreateJob(e: React.FormEvent) {
        e.preventDefault();

        if (!newJobForm.mobile.trim()) {
            showMessage("Customer mobile number is required to open a new job.", "warning");
            return;
        }

        if (!newJobForm.table) {
            showMessage("No available table found for a new job.", "warning");
            return;
        }

        if (jobsView.some((job) => job.table === newJobForm.table && job.status !== "Closed")) {
            showMessage(`Table ${newJobForm.table} is already occupied.`, "warning");
            return;
        }

        jobCounterRef.current += 1;
        const nextJobId = `JOB-${jobCounterRef.current}`;

        const newJob: Job = {
            id: nextJobId,
            table: newJobForm.table,
            mobile: newJobForm.mobile.trim(),
            customer: newJobForm.customer.trim() || "Walk-in Customer",
            openedAt: currentTimeLabel(),
            isClosed: false,
        };

        const nextTable = availableTables.filter((table) => table !== newJobForm.table)[0] ?? "";

        setJobs((prev) => [newJob, ...prev]);
        setBillsByJob((prev) => ({ ...prev, [nextJobId]: [] }));
        setActiveJobId(nextJobId);
        setActionTab("bill");
        setBillForm({
            type: "KOT",
            itemName: "",
            qty: "1",
            unitPrice: "",
        });
        setNewJobForm({
            table: nextTable,
            mobile: "",
            customer: "Walk-in Customer",
        });

        showMessage(`New job ${nextJobId} opened for ${newJob.table}. Add the first bill now.`, "success");
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

        const qty = Number(billForm.qty);
        const unitPrice = Number(billForm.unitPrice);

        if (!billForm.itemName.trim()) {
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

        const newBill: Bill = {
            billNo: nextBillNo,
            type: billForm.type,
            amount,
            paid: 0,
            balance: amount,
            createdAt: currentTimeLabel(),
            items: [
                {
                    name: billForm.itemName.trim(),
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
            type: "KOT",
            itemName: "",
            qty: "1",
            unitPrice: "",
        });

        showMessage(
            `${newBill.type} bill ${nextBillNo} added to ${activeJob.id} for ${currency(amount)}.`,
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

        if (activeBills.length === 0) {
            showMessage("There are no bills under the selected job.", "warning");
            return;
        }

        if (activeJob.status === "Closed") {
            showMessage("This job is already closed.", "warning");
            return;
        }

        const outstanding = activeJob.balance;

        if (outstanding <= 0) {
            showMessage("The selected job has no outstanding balance.", "warning");
            return;
        }

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

    function focusPaymentForBill(bill: Bill) {
        setActionTab("payment");
        setPaymentForm({
            target: bill.billNo,
            amount: String(bill.balance),
            method: "Cash",
        });
        showMessage(`Payment panel is prepared for ${bill.billNo}.`, "info");
    }

    function demoPrintBill(bill: Bill) {
        showMessage(`Print preview opened for ${bill.billNo} (demo only).`, "info");
    }

    function openActionPanel(tab: "job" | "bill" | "payment") {
        setActionTab(tab);

        requestAnimationFrame(() => {
            actionPanelRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 overflow-hidden rounded-[32px] border border-white/70 bg-slate-900 text-white shadow-2xl">
                    <div className="grid gap-6 p-6 md:grid-cols-[1.35fr_0.65fr] md:p-8">
                        <div>
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                <Badge className="rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/10">
                                    Client Demonstration Build
                                </Badge>
                                <Badge className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-emerald-200">
                                    Local State + Mock Data
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                Restaurant Billing System
                            </h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                                Unified front desk experience for KOT and BOT billing, table-to-job management,
                                multiple bills per job, live payment status, and an executive dashboard in one
                                polished interface.
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
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Open Tables</p>
                                <p className="mt-3 text-3xl font-semibold">{openJobsCount}</p>
                                <p className="mt-1 text-sm text-slate-400">{availableTables.length} available now</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Today Collection</p>
                                <p className="mt-3 text-3xl font-semibold">{currency(paidTotal)}</p>
                                <p className="mt-1 text-sm text-slate-400">{currency(outstandingTotal)} outstanding</p>
                            </div>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`mb-6 rounded-3xl border px-4 py-3 text-sm ${toneClasses(message.tone)}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((item, index) => (
                        <SummaryCard
                            key={item.label}
                            label={item.label}
                            value={item.value}
                            change={item.change}
                            icon={item.icon}
                            index={index}
                        />
                    ))}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <TabsList className="h-auto rounded-2xl border border-slate-200 bg-white p-1">
                            <TabsTrigger value="frontdesk" className="rounded-xl px-4 py-2.5">
                                <UtensilsCrossed className="mr-2 h-4 w-4" /> Front Desk Billing
                            </TabsTrigger>
                            <TabsTrigger value="dashboard" className="rounded-xl px-4 py-2.5">
                                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                            </TabsTrigger>
                            <TabsTrigger value="reports" className="rounded-xl px-4 py-2.5">
                                <Wallet className="mr-2 h-4 w-4" /> Reports Snapshot
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[280px] flex-1 xl:w-[320px] xl:flex-none">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by job no, table, mobile, customer"
                                    className="h-11 rounded-2xl border-slate-200 bg-white pl-10"
                                />
                            </div>
                            <Button variant="outline" className="rounded-2xl border-slate-200 bg-white">
                                <Filter className="mr-2 h-4 w-4" /> Demo Filters
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="frontdesk" className="mt-6">
                        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.25fr_0.95fr]">
                            <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-xl">Open Tables / Jobs</CardTitle>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Dynamic card view for active restaurant jobs
                                            </p>
                                        </div>
                                        <Badge className="rounded-full bg-slate-900 px-3 py-1.5 hover:bg-slate-900">
                                            {filteredJobs.length} Visible
                                        </Badge>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {FILTERS.map((filter) => (
                                            <Button
                                                key={filter}
                                                variant={activeFilter === filter ? "default" : "outline"}
                                                onClick={() => setActiveFilter(filter)}
                                                className={`rounded-2xl ${activeFilter === filter ? "bg-slate-900 text-white" : "bg-white"}`}
                                            >
                                                {filter}
                                            </Button>
                                        ))}
                                    </div>
                                </CardHeader>

                                <CardContent className="max-h-[860px] space-y-4 overflow-auto pb-6">
                                    {filteredJobs.length > 0 ? (
                                        filteredJobs.map((job) => (
                                            <JobCard
                                                key={job.id}
                                                job={job}
                                                active={activeJob?.id === job.id}
                                                onSelect={() => setActiveJobId(job.id)}
                                            />
                                        ))
                                    ) : (
                                        <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                                            No jobs match the current search/filter.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
                                    <CardHeader className="pb-4">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-2xl">{activeJob?.table ?? "No Job Selected"}</CardTitle>
                                                    {activeJob && (
                                                        <Badge className={`rounded-full border px-3 py-1 ${statusClasses(activeJob.status)}`}>
                                                            {activeJob.status}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    {activeJob ? `${activeJob.id} • ${activeJob.customer}` : "Select a job card to continue"}
                                                </p>
                                            </div>

                                            {activeJob && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-2xl border-slate-200 bg-white"
                                                        onClick={() => setActionTab("bill")}
                                                        disabled={activeJob.status === "Closed"}
                                                    >
                                                        <ReceiptText className="mr-2 h-4 w-4" /> Add Bill
                                                    </Button>
                                                    <Button
                                                        className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                                                        onClick={() => {
                                                            setActionTab("payment");
                                                            setPaymentForm({
                                                                target: "ALL",
                                                                amount: String(activeJob.balance),
                                                                method: "Cash",
                                                            });
                                                        }}
                                                        disabled={activeJob.bills === 0 || activeJob.status === "Closed"}
                                                    >
                                                        <Wallet className="mr-2 h-4 w-4" /> Take Payment
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        {activeJob ? (
                                            <>
                                                <div className="grid gap-4 md:grid-cols-4">
                                                    <div className="rounded-3xl bg-slate-50 p-4">
                                                        <p className="text-xs text-slate-500">Customer Mobile</p>
                                                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                                                            <Phone className="h-4 w-4 text-slate-500" /> {activeJob.mobile}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-3xl bg-slate-50 p-4">
                                                        <p className="text-xs text-slate-500">Opened Time</p>
                                                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
                                                            <Clock3 className="h-4 w-4 text-slate-500" /> {activeJob.openedAt}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-3xl bg-slate-50 p-4">
                                                        <p className="text-xs text-slate-500">Bills Under Job</p>
                                                        <p className="mt-3 text-sm font-medium text-slate-900">{activeJob.bills} active bills</p>
                                                    </div>
                                                    <div className="rounded-3xl bg-slate-50 p-4">
                                                        <p className="text-xs text-slate-500">ERP Sync Status</p>
                                                        <p className="mt-3 text-sm font-medium text-amber-700">Prepared for later phase</p>
                                                    </div>
                                                </div>

                                                <div className="mt-6 grid gap-4 md:grid-cols-3">
                                                    <div className="rounded-3xl border border-slate-200 p-4">
                                                        <p className="text-sm text-slate-500">Total Billed</p>
                                                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                                                            {currency(activeJob.subtotal)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
                                                        <p className="text-sm text-emerald-700">Total Paid</p>
                                                        <p className="mt-2 text-2xl font-semibold text-emerald-800">
                                                            {currency(activeJob.paid)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
                                                        <p className="text-sm text-amber-700">Balance Due</p>
                                                        <p className="mt-2 text-2xl font-semibold text-amber-800">
                                                            {currency(activeJob.balance)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                                                No job selected.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <CardTitle className="text-xl">Bills Under Selected Job</CardTitle>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    KOT and BOT bills work in the same front desk flow
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    className="rounded-2xl bg-teal-600 hover:bg-teal-700"
                                                    onClick={() => {
                                                        setActionTab("bill");
                                                        setBillForm((prev) => ({ ...prev, type: "KOT" }));
                                                    }}
                                                    disabled={!activeJob || activeJob.status === "Closed"}
                                                >
                                                    <ChefHat className="mr-2 h-4 w-4" /> New KOT Bill
                                                </Button>
                                                <Button
                                                    className="rounded-2xl bg-violet-600 hover:bg-violet-700"
                                                    onClick={() => {
                                                        setActionTab("bill");
                                                        setBillForm((prev) => ({ ...prev, type: "BOT" }));
                                                    }}
                                                    disabled={!activeJob || activeJob.status === "Closed"}
                                                >
                                                    <Wine className="mr-2 h-4 w-4" /> New BOT Bill
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {activeBills.length > 0 ? (
                                            activeBills.map((bill) => (
                                                <div key={bill.billNo} className="rounded-[28px] border border-slate-200 p-5">
                                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <BillTypeBadge type={bill.type} />
                                                                <span className="text-sm font-medium text-slate-700">{bill.billNo}</span>
                                                                <span className="text-xs text-slate-500">{bill.createdAt}</span>
                                                            </div>
                                                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                                                <div className="rounded-2xl bg-slate-50 p-3">
                                                                    <p className="text-xs text-slate-500">Bill Amount</p>
                                                                    <p className="mt-1 font-semibold text-slate-900">{currency(bill.amount)}</p>
                                                                </div>
                                                                <div className="rounded-2xl bg-emerald-50 p-3">
                                                                    <p className="text-xs text-emerald-700">Paid</p>
                                                                    <p className="mt-1 font-semibold text-emerald-800">{currency(bill.paid)}</p>
                                                                </div>
                                                                <div className="rounded-2xl bg-amber-50 p-3">
                                                                    <p className="text-xs text-amber-700">Balance</p>
                                                                    <p className="mt-1 font-semibold text-amber-800">{currency(bill.balance)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                variant="outline"
                                                                className="rounded-2xl border-slate-200 bg-white"
                                                                onClick={() => demoPrintBill(bill)}
                                                            >
                                                                Print
                                                            </Button>
                                                            <Button
                                                                className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                                                                onClick={() => focusPaymentForBill(bill)}
                                                                disabled={bill.balance === 0 || activeJob?.status === "Closed"}
                                                            >
                                                                Pay This Bill
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
                                                        <div className="grid grid-cols-[1.4fr_0.5fr_0.7fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            <div>Item</div>
                                                            <div>Qty</div>
                                                            <div className="text-right">Amount</div>
                                                        </div>
                                                        {bill.items.map((item, idx) => (
                                                            <div
                                                                key={`${bill.billNo}-${item.name}-${idx}`}
                                                                className="grid grid-cols-[1.4fr_0.5fr_0.7fr] items-center px-4 py-3 text-sm text-slate-700"
                                                            >
                                                                <div>{item.name}</div>
                                                                <div>{item.qty}</div>
                                                                <div className="text-right font-medium">{currency(item.amount)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                                                No bills yet for this job. Use the Add Bill action to create the first KOT or BOT bill.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card
                                    ref={actionPanelRef}
                                    className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Front Desk Actions</CardTitle>
                                        <p className="mt-1 text-sm text-slate-500">
                                            These forms now update local state for client demonstration
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs value={actionTab} onValueChange={setActionTab}>
                                            <TabsList className="grid w-full grid-cols-3 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                                                <TabsTrigger value="job" className="rounded-xl">
                                                    New Job
                                                </TabsTrigger>
                                                <TabsTrigger value="bill" className="rounded-xl">
                                                    Add Bill
                                                </TabsTrigger>
                                                <TabsTrigger value="payment" className="rounded-xl">
                                                    Payment
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="job" className="mt-4">
                                                <form className="space-y-4" onSubmit={handleCreateJob}>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">Available Table</label>
                                                        <select
                                                            value={newJobForm.table}
                                                            onChange={(e) =>
                                                                setNewJobForm((prev) => ({ ...prev, table: e.target.value }))
                                                            }
                                                            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                                                        >
                                                            {availableTables.length > 0 ? (
                                                                availableTables.map((table) => (
                                                                    <option key={table} value={table}>
                                                                        {table}
                                                                    </option>
                                                                ))
                                                            ) : (
                                                                <option value="">No table available</option>
                                                            )}
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">Customer Mobile</label>
                                                        <Input
                                                            value={newJobForm.mobile}
                                                            onChange={(e) =>
                                                                setNewJobForm((prev) => ({ ...prev, mobile: e.target.value }))
                                                            }
                                                            placeholder="077 123 4567"
                                                            className="h-11 rounded-2xl"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">Customer Name / Label</label>
                                                        <Input
                                                            value={newJobForm.customer}
                                                            onChange={(e) =>
                                                                setNewJobForm((prev) => ({ ...prev, customer: e.target.value }))
                                                            }
                                                            placeholder="Walk-in Customer"
                                                            className="h-11 rounded-2xl"
                                                        />
                                                    </div>

                                                    <Button
                                                        type="submit"
                                                        className="h-11 w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                                                        disabled={availableTables.length === 0}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" /> Create New Job
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
                                                        <form className="space-y-4" onSubmit={handleAddBill}>
                                                            <div className="rounded-3xl bg-slate-50 p-4">
                                                                <p className="text-xs text-slate-500">Selected Job</p>
                                                                <p className="mt-2 text-lg font-semibold text-slate-900">{activeJob.id}</p>
                                                                <p className="text-sm text-slate-500">
                                                                    {activeJob.customer} • {activeJob.table}
                                                                </p>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">Bill Type</label>
                                                                <select
                                                                    value={billForm.type}
                                                                    onChange={(e) =>
                                                                        setBillForm((prev) => ({ ...prev, type: e.target.value as BillType }))
                                                                    }
                                                                    className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                                                                >
                                                                    <option value="KOT">KOT</option>
                                                                    <option value="BOT">BOT</option>
                                                                </select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">Item Name</label>
                                                                <Input
                                                                    value={billForm.itemName}
                                                                    onChange={(e) =>
                                                                        setBillForm((prev) => ({ ...prev, itemName: e.target.value }))
                                                                    }
                                                                    placeholder="Chicken Fried Rice"
                                                                    className="h-11 rounded-2xl"
                                                                />
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
                                                                    {currency(
                                                                        Math.max(
                                                                            0,
                                                                            Number(billForm.qty || 0) * Number(billForm.unitPrice || 0)
                                                                        )
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <Button
                                                                type="submit"
                                                                className="h-11 w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                                                            >
                                                                <ReceiptText className="mr-2 h-4 w-4" /> Add Bill to Job
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
                                                    <div className="space-y-4">
                                                        <div className="rounded-3xl bg-slate-50 p-4">
                                                            <p className="text-xs text-slate-500">Selected Job</p>
                                                            <p className="mt-2 text-lg font-semibold text-slate-900">{activeJob.id}</p>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                {activeJob.customer} • {activeJob.table}
                                                            </p>
                                                        </div>

                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            <div className="rounded-3xl border border-slate-200 p-4">
                                                                <p className="text-xs text-slate-500">Amount Due</p>
                                                                <p className="mt-2 text-xl font-semibold text-slate-900">
                                                                    {currency(activeJob.balance)}
                                                                </p>
                                                            </div>
                                                            <div className="rounded-3xl border border-slate-200 p-4">
                                                                <p className="text-xs text-slate-500">Suggested Action</p>
                                                                <div className="mt-2 flex items-center gap-2 font-medium text-slate-900">
                                                                    {activeJob.balance <= 500 && activeJob.balance > 0 ? (
                                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                                    ) : (
                                                                        <AlertCircle className="h-4 w-4 text-amber-600" />
                                                                    )}
                                                                    {activeJob.balance === 0
                                                                        ? "Already Settled"
                                                                        : activeJob.balance <= 500
                                                                            ? "Close Job After Payment"
                                                                            : "Collect Remaining Balance"}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">Target</label>
                                                            <select
                                                                value={paymentForm.target}
                                                                onChange={(e) =>
                                                                    setPaymentForm((prev) => ({ ...prev, target: e.target.value }))
                                                                }
                                                                className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                                                            >
                                                                <option value="ALL">All Outstanding Bills</option>
                                                                {activeBills
                                                                    .filter((bill) => bill.balance > 0)
                                                                    .map((bill) => (
                                                                        <option key={bill.billNo} value={bill.billNo}>
                                                                            {bill.billNo} • {currency(bill.balance)}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">Payment Amount</label>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={paymentForm.amount}
                                                                onChange={(e) =>
                                                                    setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))
                                                                }
                                                                className="h-11 rounded-2xl"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">Payment Method</label>
                                                            <div className="grid grid-cols-3 gap-3">
                                                                {[
                                                                    { key: "Cash", icon: Wallet },
                                                                    { key: "Card", icon: CreditCard },
                                                                    { key: "Transfer", icon: Landmark },
                                                                ].map((item) => {
                                                                    const Icon = item.icon;
                                                                    const active = paymentForm.method === item.key;
                                                                    return (
                                                                        <button
                                                                            key={item.key}
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setPaymentForm((prev) => ({
                                                                                    ...prev,
                                                                                    method: item.key as PaymentMethod,
                                                                                }))
                                                                            }
                                                                            className={`rounded-3xl border p-4 text-left shadow-sm ${active
                                                                                ? "border-slate-900 bg-slate-900 text-white"
                                                                                : "border-slate-200 bg-white text-slate-900"
                                                                                }`}
                                                                        >
                                                                            <Icon className="mb-3 h-5 w-5" />
                                                                            <p className="font-medium">{item.key}</p>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            <Button
                                                                className="h-12 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                                                                onClick={() => handleApplyPayment(false)}
                                                                disabled={activeJob.balance === 0}
                                                            >
                                                                Apply Payment
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="h-12 rounded-2xl border-slate-300 bg-white"
                                                                onClick={() => handleApplyPayment(true)}
                                                                disabled={activeJob.balance === 0}
                                                            >
                                                                Complete Full Settlement <ArrowRight className="ml-2 h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        <p className="text-xs leading-5 text-slate-500">
                                                            Demo behavior: once total balance reaches zero, the job closes
                                                            automatically and the table becomes available for a new job.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                                                        Select a job first.
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Table Availability</CardTitle>
                                        <p className="mt-1 text-sm text-slate-500">Live view of open and available tables</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-2">
                                            {ALL_TABLES.map((table) => {
                                                const occupied = jobsView.some(
                                                    (job) => job.table === table && job.status !== "Closed"
                                                );
                                                return (
                                                    <div
                                                        key={table}
                                                        className={`rounded-2xl border px-3 py-3 text-center text-sm font-medium ${occupied
                                                            ? "border-amber-200 bg-amber-50 text-amber-800"
                                                            : "border-emerald-200 bg-emerald-50 text-emerald-800"
                                                            }`}
                                                    >
                                                        {table}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Phase 2 Integration Provision</CardTitle>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Prepared placeholders for later backend and ERP connection
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm text-slate-600">
                                        <div className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4">
                                            <Package className="mt-0.5 h-4 w-4 text-slate-700" />
                                            <div>
                                                <p className="font-medium text-slate-900">Inventory Handoff</p>
                                                <p>Provision to sync finalized KOT/BOT item lines to ERP stock flow later.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4">
                                            <Wallet className="mt-0.5 h-4 w-4 text-slate-700" />
                                            <div>
                                                <p className="font-medium text-slate-900">Finance Posting</p>
                                                <p>Provision to post bill totals, taxes, payments, and settlement status later.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4">
                                            <Sparkles className="mt-0.5 h-4 w-4 text-slate-700" />
                                            <div>
                                                <p className="font-medium text-slate-900">API Ready Screen States</p>
                                                <p>
                                                    Loading, empty, success, partial-payment, and auto-close states are already reflected in the UI.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="dashboard" className="mt-6">
                        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                            <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
                                <CardHeader>
                                    <CardTitle className="text-xl">Today Sales Trend</CardTitle>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Demo chart reacts to current mock totals
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[360px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={salesTrend}>
                                                <defs>
                                                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.35} />
                                                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0.03} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="hour" tickLine={false} axisLine={false} />
                                                <YAxis tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    formatter={(value) =>
                                                        typeof value === "number" ? currency(value) : String(value ?? "")
                                                    }
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="sales"
                                                    stroke="#0f172a"
                                                    fill="url(#salesGradient)"
                                                    strokeWidth={3}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid gap-6">
                                <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
                                    <CardHeader>
                                        <CardTitle className="text-xl">KOT vs BOT Split</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[260px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={billingSplit}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        innerRadius={60}
                                                        outerRadius={90}
                                                        paddingAngle={5}
                                                    >
                                                        {billingSplit.map((entry) => (
                                                            <Cell key={entry.name} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value) =>
                                                            typeof value === "number" ? currency(value) : String(value ?? "")
                                                        }
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {billingSplit.map((entry) => (
                                                <div key={entry.name} className="rounded-3xl bg-slate-50 p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-3 w-3 rounded-full" style={{ background: entry.color }} />
                                                        <p className="text-sm text-slate-500">{entry.name}</p>
                                                    </div>
                                                    <p className="mt-2 text-lg font-semibold text-slate-900">{currency(entry.value)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Table Zone Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[260px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={tableActivity} layout="vertical" margin={{ left: 12, right: 12 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                    <XAxis type="number" tickLine={false} axisLine={false} />
                                                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={70} />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#334155" radius={[0, 12, 12, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-6">
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {[
                                {
                                    title: "Open Jobs Summary",
                                    text: `${openJobsCount} active jobs are currently running across ${ALL_TABLES.length} tables.`,
                                },
                                {
                                    title: "KOT / BOT Performance",
                                    text: `KOT ${currency(kotTotal)} • BOT ${currency(botTotal)} from ${allBills.length} total bills.`,
                                },
                                {
                                    title: "Collection Snapshot",
                                    text: `${currency(paidTotal)} collected so far with ${currency(outstandingTotal)} still outstanding.`,
                                },
                                {
                                    title: "Table Utilization",
                                    text: `${ALL_TABLES.length - availableTables.length} tables occupied and ${availableTables.length} available.`,
                                },
                                {
                                    title: "ERP Integration Queue",
                                    text: "Reserved widget area for later sync logs and finance/inventory posting confirmation.",
                                },
                                {
                                    title: "Client Demo Notes",
                                    text: "This build is frontend-first. The UI now behaves interactively with local state while backend and ERP integration stay for phase 2.",
                                },
                            ].map((item) => (
                                <Card key={item.title} className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
                                    <CardContent className="p-6">
                                        <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}