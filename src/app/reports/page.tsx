"use client";

import { useEffect, useState } from "react";

import AppShell from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type ReportsData = {
  reportDate: string;
  arrivals: Array<{ reservationNo: string; guestName: string; reservedRoomNo?: string | null; boardBasisName?: string | null; reservationStatus: string }>;
  departures: Array<{ stayNo: string; guestName: string; roomNo?: string | null; boardBasisName?: string | null; balanceAmount: number }>;
  inHouse: Array<{ stayNo: string; guestName: string; roomNo?: string | null; checkInDate?: string | null; balanceAmount: number }>;
  roomStatus: Array<{ roomNo: string; roomTypeName: string; floorName: string; currentStatus: string; defaultRate: number }>;
  outletSales: Array<{ outletName: string; billCount: number; grossAmount: number; paidAmount: number; balanceAmount: number }>;
  guestBalances: Array<{ stayNo: string; guestName: string; roomNo?: string | null; balanceAmount: number }>;
  housekeeping: Array<{ taskId: number; roomNo: string; floorName: string; taskStatus: string; guestName?: string | null; createdAt: string }>;
};

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

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-[28px] border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardContent className="p-5">
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        <div className="mt-4">{children}</div>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [data, setData] = useState<ReportsData | null>(null);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        setErrorText("");
        const report = await readJson<ReportsData>(`/api/reports/operations?date=${reportDate}`);
        setData(report);
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : "Failed to load reports.");
      }
    })();
  }, [reportDate]);

  return (
    <AppShell title="Reports" description="Daily operational reports from live hotel transactions and master data.">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="rounded-[24px] border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Report Date</p>
          <div className="mt-2">
            <Input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="h-11 rounded-2xl" />
          </div>
        </div>
      </div>

      {errorText ? (
        <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{errorText}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Arrival List" subtitle="Reservations arriving on the selected date.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Reservation</th>
                  <th className="pb-3 pr-4 font-medium">Guest</th>
                  <th className="pb-3 pr-4 font-medium">Room</th>
                  <th className="pb-3 pr-4 font-medium">Board</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.arrivals ?? []).map((row) => (
                  <tr key={row.reservationNo} className="border-t border-slate-100">
                    <td className="py-3 pr-4">{row.reservationNo}</td>
                    <td className="py-3 pr-4">{row.guestName}</td>
                    <td className="py-3 pr-4">{row.reservedRoomNo || '-'}</td>
                    <td className="py-3 pr-4">{row.boardBasisName || '-'}</td>
                    <td className="py-3 pr-4">{row.reservationStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.arrivals ?? []).length === 0 ? <p className="text-sm text-slate-500">No arrivals found.</p> : null}
          </div>
        </Section>

        <Section title="Departure List" subtitle="Checked-in stays expected to depart on the selected date.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Stay</th>
                  <th className="pb-3 pr-4 font-medium">Guest</th>
                  <th className="pb-3 pr-4 font-medium">Room</th>
                  <th className="pb-3 pr-4 font-medium">Board</th>
                  <th className="pb-3 pr-4 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {(data?.departures ?? []).map((row) => (
                  <tr key={row.stayNo} className="border-t border-slate-100">
                    <td className="py-3 pr-4">{row.stayNo}</td>
                    <td className="py-3 pr-4">{row.guestName}</td>
                    <td className="py-3 pr-4">{row.roomNo || '-'}</td>
                    <td className="py-3 pr-4">{row.boardBasisName || '-'}</td>
                    <td className="py-3 pr-4">{money(Number(row.balanceAmount ?? 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.departures ?? []).length === 0 ? <p className="text-sm text-slate-500">No departures found.</p> : null}
          </div>
        </Section>

        <Section title="In-House Guest List" subtitle="Current checked-in guest list.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Stay</th>
                  <th className="pb-3 pr-4 font-medium">Guest</th>
                  <th className="pb-3 pr-4 font-medium">Room</th>
                  <th className="pb-3 pr-4 font-medium">Check-In</th>
                  <th className="pb-3 pr-4 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {(data?.inHouse ?? []).map((row) => (
                  <tr key={row.stayNo} className="border-t border-slate-100">
                    <td className="py-3 pr-4">{row.stayNo}</td>
                    <td className="py-3 pr-4">{row.guestName}</td>
                    <td className="py-3 pr-4">{row.roomNo || '-'}</td>
                    <td className="py-3 pr-4">{row.checkInDate || '-'}</td>
                    <td className="py-3 pr-4">{money(Number(row.balanceAmount ?? 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.inHouse ?? []).length === 0 ? <p className="text-sm text-slate-500">No in-house guests found.</p> : null}
          </div>
        </Section>

        <Section title="Room Status Report" subtitle="Current room status and rate reference.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Room</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">Floor</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {(data?.roomStatus ?? []).map((row) => (
                  <tr key={row.roomNo} className="border-t border-slate-100">
                    <td className="py-3 pr-4">{row.roomNo}</td>
                    <td className="py-3 pr-4">{row.roomTypeName}</td>
                    <td className="py-3 pr-4">{row.floorName}</td>
                    <td className="py-3 pr-4">{row.currentStatus}</td>
                    <td className="py-3 pr-4">{money(Number(row.defaultRate ?? 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Outlet Sales Summary" subtitle="Restaurant bills by outlet for the selected date.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Outlet</th>
                  <th className="pb-3 pr-4 font-medium">Bills</th>
                  <th className="pb-3 pr-4 font-medium">Gross</th>
                  <th className="pb-3 pr-4 font-medium">Paid</th>
                  <th className="pb-3 pr-4 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {(data?.outletSales ?? []).map((row) => (
                  <tr key={row.outletName} className="border-t border-slate-100">
                    <td className="py-3 pr-4">{row.outletName}</td>
                    <td className="py-3 pr-4">{row.billCount}</td>
                    <td className="py-3 pr-4">{money(Number(row.grossAmount ?? 0))}</td>
                    <td className="py-3 pr-4">{money(Number(row.paidAmount ?? 0))}</td>
                    <td className="py-3 pr-4">{money(Number(row.balanceAmount ?? 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.outletSales ?? []).length === 0 ? <p className="text-sm text-slate-500">No outlet sales found.</p> : null}
          </div>
        </Section>

        <Section title="Guest Balance Report" subtitle="Highest current in-house folio balances.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Stay</th>
                  <th className="pb-3 pr-4 font-medium">Guest</th>
                  <th className="pb-3 pr-4 font-medium">Room</th>
                  <th className="pb-3 pr-4 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {(data?.guestBalances ?? []).map((row) => (
                  <tr key={row.stayNo} className="border-t border-slate-100">
                    <td className="py-3 pr-4">{row.stayNo}</td>
                    <td className="py-3 pr-4">{row.guestName}</td>
                    <td className="py-3 pr-4">{row.roomNo || '-'}</td>
                    <td className="py-3 pr-4">{money(Number(row.balanceAmount ?? 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.guestBalances ?? []).length === 0 ? <p className="text-sm text-slate-500">No outstanding guest balances found.</p> : null}
          </div>
        </Section>

        <Section title="Housekeeping Report" subtitle="Open and recent housekeeping tasks.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Room</th>
                  <th className="pb-3 pr-4 font-medium">Floor</th>
                  <th className="pb-3 pr-4 font-medium">Task Status</th>
                  <th className="pb-3 pr-4 font-medium">Guest</th>
                  <th className="pb-3 pr-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {(data?.housekeeping ?? []).map((row) => (
                  <tr key={row.taskId} className="border-t border-slate-100">
                    <td className="py-3 pr-4">{row.roomNo}</td>
                    <td className="py-3 pr-4">{row.floorName}</td>
                    <td className="py-3 pr-4">{row.taskStatus}</td>
                    <td className="py-3 pr-4">{row.guestName || '-'}</td>
                    <td className="py-3 pr-4">{row.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.housekeeping ?? []).length === 0 ? <p className="text-sm text-slate-500">No housekeeping exceptions found.</p> : null}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
