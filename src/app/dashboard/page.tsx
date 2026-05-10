"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  ClipboardCheck,
  Hotel,
  ReceiptText,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type DashboardSummary = {
  reportDate: string;
  headline: {
    arrivalsToday: number;
    departuresToday: number;
    inHouseGuests: number;
    folioOutstanding: number;
    restaurantSalesToday: number;
    housekeepingOpen: number;
  };
  roomStatus: Array<{ statusName: string; roomCount: number }>;
  arrivals: Array<{
    reservationNo: string;
    guestName: string;
    roomNo?: string | null;
    roomType?: string | null;
    mobileNo?: string | null;
    reservationStatus: string;
  }>;
  departures: Array<{
    stayNo: string;
    guestName: string;
    roomNo?: string | null;
    expectedCheckOutDate?: string | null;
    balanceAmount: number;
  }>;
  outletSales: Array<{
    outletName: string;
    billCount: number;
    grossAmount: number;
  }>;
  housekeeping: Array<{
    taskId: number;
    roomNo: string;
    floorName: string;
    taskStatus: string;
    guestName?: string | null;
  }>;
};

type DashboardTrends = {
  endDate: string;
  days: number;
  trend: Array<{
    reportDate: string;
    arrivals: number;
    departures: number;
    restaurantSales: number;
    billCount: number;
  }>;
};

type ChartItem = {
  label: string;
  value: number;
  color: string;
};

const CHART_COLORS = [
  "#1d4ed8",
  "#0891b2",
  "#059669",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#475569",
];

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  const json = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok || !json.success) {
    throw new Error(json.error || "Request failed.");
  }
  return json.data;
}

function money(value: number) {
  return `LKR ${Number(value || 0).toLocaleString()}`;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function shortDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function donutArcPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const startOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", startOuter.x, startOuter.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
    "Z",
  ].join(" ");
}

function DonutChart({
  title,
  subtitle,
  items,
  totalLabel,
  valueFormatter,
}: {
  title: string;
  subtitle: string;
  items: ChartItem[];
  totalLabel: string;
  valueFormatter?: (value: number) => string;
}) {
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
  let startAngle = 0;

  return (
    <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardContent className="p-4">
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr] lg:items-center">
          <div className="flex justify-center">
            <svg viewBox="0 0 220 220" className="h-[220px] w-[220px]">
              <circle cx="110" cy="110" r="82" fill="#f8fafc" />
              {total > 0 ? (
                items.map((item, index) => {
                  const value = Number(item.value || 0);
                  const angle = (value / total) * 360;

                  if (angle >= 359.99) {
                    return (
                      <circle
                        key={`${item.label}-${index}`}
                        cx="110"
                        cy="110"
                        r="70"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="32"
                      />
                    );
                  }

                  const path = donutArcPath(110, 110, 86, 54, startAngle, startAngle + angle);
                  startAngle += angle;
                  return <path key={`${item.label}-${index}`} d={path} fill={item.color} />;
                })
              ) : (
                <circle cx="110" cy="110" r="70" fill="none" stroke="#e2e8f0" strokeWidth="26" />
              )}
              <circle cx="110" cy="110" r="48" fill="white" />
              <text x="110" y="102" textAnchor="middle" className="fill-slate-500 text-[12px] uppercase tracking-[0.18em]">
                {totalLabel}
              </text>
              <text x="110" y="126" textAnchor="middle" className="fill-slate-900 text-[28px] font-semibold">
                {total > 0 ? (valueFormatter ? valueFormatter(total) : total) : "—"}
              </text>
            </svg>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {valueFormatter ? valueFormatter(Number(item.value || 0)) : Number(item.value || 0)}
                </span>
              </div>
            ))}
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                No data available for this visual.
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SalesTrendChart({
  title,
  subtitle,
  values,
}: {
  title: string;
  subtitle: string;
  values: Array<{ label: string; amount: number; arrivals: number; departures: number; bills: number }>;
}) {
  const width = 720;
  const height = 280;
  const left = 52;
  const right = 20;
  const top = 20;
  const bottom = 42;
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;
  const maxAmount = Math.max(1, ...values.map((item) => Number(item.amount || 0)));

  const points = values.map((item, index) => {
    const x = left + (values.length <= 1 ? innerWidth / 2 : (index / (values.length - 1)) * innerWidth);
    const y = top + innerHeight - (Number(item.amount || 0) / maxAmount) * innerHeight;
    return { ...item, x, y };
  });

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const totalSales = values.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalArrivals = values.reduce((sum, item) => sum + Number(item.arrivals || 0), 0);
  const totalDepartures = values.reduce((sum, item) => sum + Number(item.departures || 0), 0);

  return (
    <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              7-day sales {money(totalSales)}
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700">
              arrivals {totalArrivals}
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">
              departures {totalDepartures}
            </span>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[640px]">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = top + innerHeight - ratio * innerHeight;
              const label = Math.round(maxAmount * ratio);
              return (
                <g key={ratio}>
                  <line x1={left} y1={y} x2={width - right} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <text x={left - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
                    {label}
                  </text>
                </g>
              );
            })}

            <polyline
              fill="none"
              stroke="#0f172a"
              strokeWidth="3"
              points={polylinePoints}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {points.map((point) => (
              <g key={point.label}>
                <circle cx={point.x} cy={point.y} r="5" fill="#0f172a" />
                <text x={point.x} y={height - 16} textAnchor="middle" className="fill-slate-500 text-[11px]">
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        setErrorText("");
        const [summaryData, trendData] = await Promise.all([
          readJson<DashboardSummary>(`/api/dashboard/summary?date=${reportDate}`),
          readJson<DashboardTrends>(`/api/dashboard/trends?date=${reportDate}&days=7`),
        ]);
        setSummary(summaryData);
        setTrends(trendData);
      } catch (error) {
        setSummary(null);
        setTrends(null);
        setErrorText(error instanceof Error ? error.message : "Failed to load dashboard.");
      }
    })();
  }, [reportDate]);

  const roomStatusItems = useMemo<ChartItem[]>(
    () =>
      (summary?.roomStatus ?? []).map((row, index) => ({
        label: row.statusName,
        value: Number(row.roomCount ?? 0),
        color: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [summary]
  );

  const outletItems = useMemo<ChartItem[]>(
    () =>
      (summary?.outletSales ?? []).map((row, index) => ({
        label: row.outletName,
        value: Number(row.grossAmount ?? 0),
        color: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [summary]
  );

  const trendValues = useMemo(
    () =>
      (trends?.trend ?? []).map((row) => ({
        label: shortDate(row.reportDate),
        amount: Number(row.restaurantSales ?? 0),
        arrivals: Number(row.arrivals ?? 0),
        departures: Number(row.departures ?? 0),
        bills: Number(row.billCount ?? 0),
      })),
    [trends]
  );

  function displayNumber(value?: number | null) {
    return summary ? String(Number(value ?? 0)) : "—";
  }

  function displayMoney(value?: number | null) {
    return summary ? money(Number(value ?? 0)) : "—";
  }

  return (
    <AppShell
      title="Dashboard"
      description="Live operational dashboard with DB-bound charts and management visuals."
      headerActions={
        <div className="rounded-[24px] border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Report Date</p>
          <div className="mt-2">
            <Input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="h-11 min-w-[210px] rounded-2xl"
            />
          </div>
        </div>
      }
    >
      {errorText ? (
        <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorText}
        </div>
      ) : null}

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {[
          {
            label: "Arrivals Today",
            value: displayNumber(summary?.headline.arrivalsToday),
            helper: "From reservation arrivals",
            icon: Users,
          },
          {
            label: "Departures Today",
            value: displayNumber(summary?.headline.departuresToday),
            helper: "Expected checkout list",
            icon: BedDouble,
          },
          {
            label: "In-House",
            value: displayNumber(summary?.headline.inHouseGuests),
            helper: "Checked-in stays",
            icon: Hotel,
          },
          {
            label: "Restaurant Sales",
            value: displayMoney(summary?.headline.restaurantSalesToday),
            helper: "Bills created on date",
            icon: UtensilsCrossed,
          },
          {
            label: "Folio Outstanding",
            value: displayMoney(summary?.headline.folioOutstanding),
            helper: "Open in-house balances",
            icon: ReceiptText,
          },
          {
            label: "Housekeeping Open",
            value: displayNumber(summary?.headline.housekeepingOpen),
            helper: "Dirty and cleaning tasks",
            icon: ClipboardCheck,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
              <CardContent className="flex items-start justify-between p-4">
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

      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <DonutChart
          title="Room Status Mix"
          subtitle="Current live room distribution. This stays tied to the current room master status, so the total reflects the current room count rather than the selected report date."
          items={roomStatusItems}
          totalLabel="rooms"
        />
        <DonutChart
          title="Outlet Sales Mix"
          subtitle="Current date restaurant sales split."
          items={outletItems}
          totalLabel="sales"
          valueFormatter={(value) => money(value)}
        />
      </div>

      <div className="mb-6">
        <SalesTrendChart
          title="Restaurant Sales Trend"
          subtitle="Live seven-day sales line based on current DB transactions."
          values={trendValues}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardContent className="p-4">
            <p className="text-lg font-semibold text-slate-900">Arrivals Today</p>
            <div className="mt-4 space-y-3">
              {(summary?.arrivals ?? []).length > 0 ? (
                summary!.arrivals.map((row) => (
                  <div key={row.reservationNo} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{row.guestName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {row.reservationNo}{row.roomNo ? ` • Room ${row.roomNo}` : ""}{row.roomType ? ` • ${row.roomType}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700">
                        {row.reservationStatus}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  {summary ? "No arrivals for the selected date." : "Summary not loaded yet."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardContent className="p-4">
            <p className="text-lg font-semibold text-slate-900">Departures Today</p>
            <div className="mt-4 space-y-3">
              {(summary?.departures ?? []).length > 0 ? (
                summary!.departures.map((row) => (
                  <div key={row.stayNo} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{row.guestName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {row.stayNo}{row.roomNo ? ` • Room ${row.roomNo}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">
                        {money(Number(row.balanceAmount ?? 0))}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  {summary ? "No departures for the selected date." : "Summary not loaded yet."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardContent className="p-4">
            <p className="text-lg font-semibold text-slate-900">Restaurant Sales by Outlet</p>
            <div className="mt-4 space-y-3">
              {(summary?.outletSales ?? []).length > 0 ? (
                summary!.outletSales.map((row) => (
                  <div key={row.outletName} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{row.outletName}</p>
                        <p className="mt-1 text-sm text-slate-500">{row.billCount} bills</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                        {money(Number(row.grossAmount ?? 0))}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  {summary ? "No outlet sales for the selected date." : "Summary not loaded yet."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
          <CardContent className="p-4">
            <p className="text-lg font-semibold text-slate-900">Housekeeping Open Tasks</p>
            <div className="mt-4 space-y-3">
              {(summary?.housekeeping ?? []).length > 0 ? (
                summary!.housekeeping.map((row) => (
                  <div key={row.taskId} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">Room {row.roomNo}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {row.floorName}{row.guestName ? ` • ${row.guestName}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700">
                        {row.taskStatus}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  {summary ? "No housekeeping exceptions for the selected date." : "Summary not loaded yet."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Occupied", value: roomStatusItems.find((x) => x.label === "Occupied")?.value ?? 0 },
          { label: "Vacant Ready", value: roomStatusItems.find((x) => x.label === "Vacant Ready")?.value ?? 0 },
          { label: "Dirty", value: roomStatusItems.find((x) => x.label === "Dirty")?.value ?? 0 },
          { label: "Reserved", value: roomStatusItems.find((x) => x.label === "Reserved")?.value ?? 0 },
        ].map((item) => (
          <Card key={item.label} className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {summary ? item.value : "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 rounded-[28px] border border-white/60 bg-white/85 p-4 shadow-sm backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">DB-bound dashboard preserved</p>
            <p className="mt-1 text-sm text-slate-500">
              These visuals load from live reservation, stay, room, folio, restaurant, and housekeeping data.
              No dashboard control here is intended to fall back to mock objects.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
