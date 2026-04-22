"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  BedDouble,
  ClipboardList,
  Hotel,
  ReceiptText,
  Sparkles,
  Wallet,
  Wrench,
  Building2,
} from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import ModuleReadinessCard from "@/components/dashboard/module-readiness-card";
import SummaryMetricCard from "@/components/dashboard/summary-metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getManagementSummary } from "@/lib/management-summary";
import { ManagementSummary } from "@/types/management-summary";

type ApiMode = "loading" | "connected" | "fallback";

function currency(value: number) {
  return `LKR ${value.toLocaleString()}`;
}

const occupancyColors = ["#0f766e", "#0ea5e9", "#334155", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function DashboardPage() {
  const fallbackSummary = useMemo(() => getManagementSummary(), []);
  const [summary, setSummary] = useState<ManagementSummary>(fallbackSummary);
  const [apiMode, setApiMode] = useState<ApiMode>("loading");

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        const response = await fetch("/api/management-summary", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Management summary API failed");
        }

        const json = await response.json();

        if (!isMounted) return;

        setSummary((json?.data as ManagementSummary) ?? fallbackSummary);
        setApiMode("connected");
      } catch {
        if (!isMounted) return;
        setSummary(fallbackSummary);
        setApiMode("fallback");
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [fallbackSummary]);

  const cards = [
    {
      label: "Reservations",
      value: String(summary.topLine.totalReservations),
      helper: `${summary.topLine.arrivalsToday} arrivals today`,
      icon: ClipboardList,
    },
    {
      label: "In-House Rooms",
      value: String(summary.topLine.inHouseGuests),
      helper: `${summary.topLine.dirtyRooms} dirty rooms pending turnover`,
      icon: BedDouble,
    },
    {
      label: "Restaurant Jobs",
      value: String(summary.topLine.openRestaurantJobs),
      helper: `${summary.topLine.activeOutlets} outlets active in demo`,
      icon: ReceiptText,
    },
    {
      label: "Revenue Snapshot",
      value: currency(summary.topLine.todayRevenue),
      helper: `${currency(summary.topLine.outstandingBalance)} outstanding`,
      icon: Wallet,
    },
  ];

  return (
    <AppShell
      title="Dashboard"
      description="Sprint 6 dashboard wraps the Phase 1 modules into one management summary with operational charts and readiness status."
    >
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
        Dashboard data mode:{" "}
        <span className="font-medium text-slate-900">
          {apiMode === "connected" ? "Mock API Connected" : apiMode === "fallback" ? "Local Fallback" : "Loading"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SummaryMetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            helper={card.helper}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Outlet Revenue Mix</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Demo distribution across active income centers in the hotel property.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.outletRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#334155" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Room Status Mix</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Occupancy and turnover visibility across front office and housekeeping.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.occupancyMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {summary.occupancyMix.map((entry, index) => (
                      <Cell key={entry.name} fill={occupancyColors[index % occupancyColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {summary.occupancyMix.map((item, index) => (
                <div key={item.name} className="rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: occupancyColors[index % occupancyColors.length] }}
                    />
                    <p className="text-sm text-slate-500">{item.name}</p>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Reservation Pipeline</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Status spread from tentative bookings through checked-out guests.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.reservationPipeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Housekeeping Flow</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Dirty-room turnover progress from departure to ready state.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.housekeepingFlow}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-slate-700" />
          <h3 className="text-xl font-semibold text-slate-900">Phase 1 Module Readiness</h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {summary.modules.map((module) => (
            <ModuleReadinessCard key={module.name} module={module} />
          ))}

          <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Wrench className="h-5 w-5" />
              </div>
              <p className="text-lg font-semibold text-slate-900">Stabilization Notes</p>
              <div className="mt-4 space-y-3">
                {[
                  "Shared shell, route structure, and mock API pattern are consistent across modules.",
                  "Front office checkout now hands rooms into housekeeping turnover flow.",
                  "Restaurant billing supports FIT and room-guest handling with outlet-aware logic.",
                  "Reports and dashboard now present the full Phase 1 system as one unified demo.",
                ].map((item) => (
                  <div key={item} className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Building2 className="h-5 w-5" />
              </div>
              <p className="text-lg font-semibold text-slate-900">Phase 2 Direction</p>
              <div className="mt-4 space-y-3">
                {[
                  "Sidebar collapse/icon mode and UI refinements.",
                  "Real backend contracts and SQL-backed persistence.",
                  "ERP and finance/inventory integration stages.",
                  "Additional outlet/POS extensions and deeper reporting.",
                ].map((item) => (
                  <div key={item} className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
