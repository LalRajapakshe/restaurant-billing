"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/app-shell";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type PortalRequestRow = {
  portalReservationRequestId: number;
  requestReference: string;
  requestStatus: string;
  sourceMode: string;
  guestName: string;
  email: string;
  mobileNo: string;
  arrivalDate: string;
  departureDate: string;
  adults: number;
  children: number;
  hotelId: number;
  hotelName: string;
  tenantName?: string | null;
  roomTypeId?: number | null;
  roomTypeName?: string | null;
  ratePlanId?: number | null;
  ratePlanName?: string | null;
  convertedReservationId?: number | null;
  convertedAt?: string | null;
  createdAt: string;
};

type ConvertResult = {
  reservationId: number;
  reservationNo: string;
  portalRequestId: number;
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

export default function PortalAdminRequestsPage() {
  const [status, setStatus] = useState("Pending");
  const [rows, setRows] = useState<PortalRequestRow[]>([]);
  const [message, setMessage] = useState<{ tone: "success" | "warning"; text: string } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    return params.toString();
  }, [status]);

  async function loadRows() {
    try {
      setMessage(null);
      const data = await readJson<PortalRequestRow[]>(`/api/portal-admin/requests?${queryString}`);
      setRows(data);
    } catch (error) {
      setRows([]);
      setMessage({
        tone: "warning",
        text: error instanceof Error ? error.message : "Failed to load portal requests.",
      });
    }
  }

  useEffect(() => {
    void loadRows();
  }, [queryString]);

  async function handleConvert(requestId: number) {
    try {
      setBusyId(requestId);
      const result = await readJson<ConvertResult>(`/api/portal-admin/requests/${requestId}/confirm`, {
        method: "POST",
      });
      setMessage({
        tone: "success",
        text: `Portal request converted successfully. Reservation No: ${result.reservationNo}`,
      });
      await loadRows();
    } catch (error) {
      setMessage({
        tone: "warning",
        text: error instanceof Error ? error.message : "Failed to convert request.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppShell
      title="Portal Reservation Requests"
      description="Review public reservation requests and convert them into live internal reservations."
    >
      <div className="grid gap-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Request Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 min-w-[220px] rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="Converted">Converted</option>
                <option value="">All</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => void loadRows()}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </div>

        {message ? (
          <div
            className={`rounded-[28px] border px-4 py-3 text-sm ${
              message.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="grid gap-4">
          {rows.map((row) => (
            <div key={row.portalReservationRequestId} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {row.requestReference} • {row.guestName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {row.hotelName}{row.tenantName ? ` • ${row.tenantName}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {row.arrivalDate} to {row.departureDate} • Adults {row.adults} • Children {row.children}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {row.roomTypeName || "Room type pending"}{row.ratePlanName ? ` • ${row.ratePlanName}` : ""}
                  </p>
                </div>

                <div className="text-right">
                  <div className="rounded-2xl bg-slate-100 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Status</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{row.requestStatus}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>{row.email}</span>
                <span>•</span>
                <span>{row.mobileNo}</span>
                {row.convertedReservationId ? (
                  <>
                    <span>•</span>
                    <span>Converted Reservation ID {row.convertedReservationId}</span>
                  </>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-3">
                {row.requestStatus === "Pending" ? (
                  <button
                    type="button"
                    onClick={() => void handleConvert(row.portalReservationRequestId)}
                    disabled={busyId === row.portalReservationRequestId}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {busyId === row.portalReservationRequestId ? "Converting..." : "Convert to Reservation"}
                  </button>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Already converted
                  </div>
                )}
              </div>
            </div>
          ))}

          {rows.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-sm text-slate-500">
              No portal reservation requests found for the selected status.
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
