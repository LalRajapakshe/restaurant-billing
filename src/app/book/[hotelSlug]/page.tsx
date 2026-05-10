"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/app-shell";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type HotelHeader = {
  hotelId: number;
  hotelCode: string;
  hotelSlug: string;
  hotelName: string;
  cityName?: string | null;
  countryName?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  defaultCurrencyCode: string;
  bookingEmail?: string | null;
  bookingPhone?: string | null;
};

type RoomRate = {
  roomTypeId: number;
  roomTypeName: string;
  inventoryCount: number;
  maxAdults: number;
  maxChildren: number;
  ratePlanId: number;
  ratePlanCode: string;
  ratePlanName: string;
  boardBasisId?: number | null;
  boardBasisName?: string | null;
  cancellationSummary?: string | null;
  isRefundable: boolean;
  nightlyRate: number | null;
};

type HotelPortalData = {
  hotel: HotelHeader;
  roomRates: RoomRate[];
};

type RequestResult = {
  portalReservationRequestId: number;
  requestReference: string;
  requestStatus: string;
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

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function HotelPortalPage() {
  const params = useParams<{ hotelSlug: string }>();
  const searchParams = useSearchParams();

  const hotelSlug = String(params?.hotelSlug ?? "");
  const [arrivalDate, setArrivalDate] = useState(searchParams.get("arrivalDate") ?? todayPlus(7));
  const [departureDate, setDepartureDate] = useState(searchParams.get("departureDate") ?? todayPlus(8));
  const [adults, setAdults] = useState(searchParams.get("adults") ?? "2");
  const [children, setChildren] = useState(searchParams.get("children") ?? "0");
  const [data, setData] = useState<HotelPortalData | null>(null);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "warning"; text: string } | null>(null);
  const [form, setForm] = useState({
    guestName: "",
    email: "",
    mobileNo: "",
    notes: "",
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      arrivalDate,
      departureDate,
      adults,
      children,
    });
    return params.toString();
  }, [arrivalDate, departureDate, adults, children]);

  useEffect(() => {
    if (!hotelSlug) return;

    void (async () => {
      try {
        setMessage(null);
        const result = await readJson<HotelPortalData>(`/api/public/hotels/${hotelSlug}?${queryString}`);
        setData(result);
        setSelectedRatePlanId((current) => current || String(result.roomRates[0]?.ratePlanId ?? ""));
      } catch (error) {
        setData(null);
        setMessage({
          tone: "warning",
          text: error instanceof Error ? error.message : "Failed to load hotel booking portal.",
        });
      }
    })();
  }, [hotelSlug, queryString]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!data?.hotel?.hotelId) {
      setMessage({ tone: "warning", text: "Hotel context is missing." });
      return;
    }

    const selectedRate = data.roomRates.find((row) => String(row.ratePlanId) === selectedRatePlanId);

    try {
      const result = await readJson<RequestResult>("/api/public/reservation-requests", {
        method: "POST",
        body: JSON.stringify({
          hotelId: data.hotel.hotelId,
          sourceMode: "hotel-portal",
          guestName: form.guestName,
          email: form.email,
          mobileNo: form.mobileNo,
          arrivalDate,
          departureDate,
          adults: Number(adults),
          children: Number(children),
          roomTypeId: selectedRate?.roomTypeId ?? null,
          ratePlanId: selectedRate?.ratePlanId ?? null,
          notes: form.notes,
        }),
      });

      setMessage({
        tone: "success",
        text: `Reservation request saved successfully. Reference: ${result.requestReference}`,
      });
      setForm({
        guestName: "",
        email: "",
        mobileNo: "",
        notes: "",
      });
    } catch (error) {
      setMessage({
        tone: "warning",
        text: error instanceof Error ? error.message : "Failed to save reservation request.",
      });
    }
  }

  return (
    <AppShell
      title={data?.hotel.hotelName || "Hotel Reservation Portal"}
      description="Hotel-specific direct booking portal operating on the shared reservation platform."
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Arrival</label>
                <input
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Departure</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Adults</label>
                <input
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Children</label>
                <input
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) => setChildren(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm"
                />
              </div>
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

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-2xl font-semibold text-slate-900">
              {data?.hotel.hotelName || "Loading hotel..."}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {data?.hotel.cityName || "City not set"}{data?.hotel.countryName ? `, ${data.hotel.countryName}` : ""}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {data?.hotel.fullDescription || data?.hotel.shortDescription || "Hotel description not yet configured."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Check-in: {data?.hotel.checkInTime || "14:00"}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Check-out: {data?.hotel.checkOutTime || "12:00"}
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {(data?.roomRates ?? []).map((row) => {
              const selected = String(row.ratePlanId) === selectedRatePlanId;
              return (
                <button
                  key={row.ratePlanId}
                  type="button"
                  onClick={() => setSelectedRatePlanId(String(row.ratePlanId))}
                  className={`rounded-[28px] border p-5 text-left shadow-sm transition ${
                    selected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">{row.roomTypeName}</p>
                      <p className={`mt-1 text-sm ${selected ? "text-slate-200" : "text-slate-500"}`}>
                        {row.ratePlanName}{row.boardBasisName ? ` • ${row.boardBasisName}` : ""}
                      </p>
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${selected ? "bg-white/10" : "bg-slate-100"}`}>
                      <p className={`text-[11px] uppercase tracking-[0.18em] ${selected ? "text-slate-200" : "text-slate-500"}`}>
                        Nightly Rate
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {row.nightlyRate != null
                          ? `${data?.hotel.defaultCurrencyCode || "LKR"} ${Number(row.nightlyRate).toLocaleString()}`
                          : "Rate pending"}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-4 flex flex-wrap gap-2 text-xs ${selected ? "text-slate-200" : "text-slate-500"}`}>
                    <span className={`rounded-full px-3 py-1 ${selected ? "bg-white/10" : "bg-slate-100"}`}>
                      Inventory {row.inventoryCount}
                    </span>
                    <span className={`rounded-full px-3 py-1 ${selected ? "bg-white/10" : "bg-slate-100"}`}>
                      Max Adults {row.maxAdults}
                    </span>
                    <span className={`rounded-full px-3 py-1 ${selected ? "bg-white/10" : "bg-slate-100"}`}>
                      Max Children {row.maxChildren}
                    </span>
                    <span className={`rounded-full px-3 py-1 ${selected ? "bg-white/10" : "bg-slate-100"}`}>
                      {row.isRefundable ? "Refundable" : "Non-refundable"}
                    </span>
                  </div>

                  {row.cancellationSummary ? (
                    <p className={`mt-3 text-sm ${selected ? "text-slate-200" : "text-slate-600"}`}>
                      {row.cancellationSummary}
                    </p>
                  ) : null}
                </button>
              );
            })}

            {data && data.roomRates.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-sm text-slate-500">
                No published room/rate plans found for this hotel.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xl font-semibold text-slate-900">Request Reservation</p>
          <p className="mt-1 text-sm text-slate-500">
            Package 1 captures reservation requests into the shared reservation platform.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Selected Rate</label>
              <select
                value={selectedRatePlanId}
                onChange={(e) => setSelectedRatePlanId(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              >
                {(data?.roomRates ?? []).map((row) => (
                  <option key={row.ratePlanId} value={String(row.ratePlanId)}>
                    {row.roomTypeName} • {row.ratePlanName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Lead Guest Name</label>
              <input
                value={form.guestName}
                onChange={(e) => setForm((prev) => ({ ...prev, guestName: e.target.value }))}
                className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Mobile</label>
                <input
                  value={form.mobileNo}
                  onChange={(e) => setForm((prev) => ({ ...prev, mobileNo: e.target.value }))}
                  className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Notes / Requests</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Save Reservation Request
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
