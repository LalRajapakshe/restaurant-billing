"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/app-shell";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type PublicHotel = {
  hotelId: number;
  hotelCode: string;
  hotelSlug: string;
  hotelName: string;
  cityName?: string | null;
  countryName?: string | null;
  shortDescription?: string | null;
  defaultCurrencyCode: string;
  publishedRoomTypes: number;
  startingRate: number | null;
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

export default function BookingEnginePage() {
  const [arrivalDate, setArrivalDate] = useState(todayPlus(7));
  const [departureDate, setDepartureDate] = useState(todayPlus(8));
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [query, setQuery] = useState("");
  const [hotels, setHotels] = useState<PublicHotel[]>([]);
  const [message, setMessage] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      arrivalDate,
      departureDate,
      adults,
      children,
      query,
    });
    return params.toString();
  }, [arrivalDate, departureDate, adults, children, query]);

  useEffect(() => {
    void (async () => {
      try {
        setMessage("");
        const rows = await readJson<PublicHotel[]>(`/api/public/hotels?${queryString}`);
        setHotels(rows);
      } catch (error) {
        setHotels([]);
        setMessage(error instanceof Error ? error.message : "Failed to load hotels.");
      }
    })();
  }, [queryString]);

  return (
    <AppShell
      title="Booking Engine"
      description="Search multiple hotels from one shared reservation platform."
    >
      <div className="grid gap-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr_0.8fr_0.8fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Hotel / City Search</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hotel or city"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Arrival</label>
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Departure</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Adults</label>
              <input
                type="number"
                min="1"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Children</label>
              <input
                type="number"
                min="0"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              />
            </div>
          </div>
        </div>

        {message ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {message}
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          {hotels.map((hotel) => (
            <div key={hotel.hotelId} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold text-slate-900">{hotel.hotelName}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {hotel.cityName || "City not set"}{hotel.countryName ? `, ${hotel.countryName}` : ""}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Starting Rate</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {hotel.startingRate != null
                      ? `${hotel.defaultCurrencyCode} ${Number(hotel.startingRate).toLocaleString()}`
                      : "Rate pending"}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {hotel.shortDescription || "Hotel summary not yet configured."}
              </p>

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  Published room types: <span className="font-medium text-slate-800">{hotel.publishedRoomTypes}</span>
                </p>
                <Link
                  href={`/book/${hotel.hotelSlug}?arrivalDate=${arrivalDate}&departureDate=${departureDate}&adults=${adults}&children=${children}`}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  View Hotel Portal
                </Link>
              </div>
            </div>
          ))}

          {hotels.length === 0 && !message ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-sm text-slate-500">
              No hotels matched the current search.
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
