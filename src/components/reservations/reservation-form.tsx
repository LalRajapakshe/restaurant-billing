"use client";

import { useMemo } from "react";

import PanelShell from "@/components/shared/panel-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  boardBasisOptions,
  ReservationPayload,
  reservationStatuses,
} from "@/types/reservation";

type ReservationFormProps = {
  mode: "create" | "edit";
  form: ReservationPayload;
  onChange: <K extends keyof ReservationPayload>(field: K, value: ReservationPayload[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
};

function calculateNights(arrivalDate?: string, departureDate?: string) {
  if (!arrivalDate || !departureDate) return 0;

  const start = new Date(arrivalDate);
  const end = new Date(departureDate);
  const diff = end.getTime() - start.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  return Number.isFinite(days) && days > 0 ? days : 0;
}

export default function ReservationForm({
  mode,
  form,
  onChange,
  onSubmit,
  onReset,
}: ReservationFormProps) {
  const nights = useMemo(
    () => calculateNights(form.arrivalDate, form.departureDate),
    [form.arrivalDate, form.departureDate]
  );

  return (
    <PanelShell
      title={mode === "create" ? "New Reservation" : "Edit Reservation"}
      description="DB-ready reservation form using mock APIs and stable contract structure."
      minimizedContent={
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">
            {form.guestName || "Guest name pending"}
          </p>
          <p className="mt-1 text-slate-500">
            {form.arrivalDate || "No arrival"} → {form.departureDate || "No departure"}
          </p>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Guest Name</label>
            <Input
              value={form.guestName ?? ""}
              onChange={(e) => onChange("guestName", e.target.value)}
              className="h-11 rounded-2xl"
              placeholder="Guest full name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Mobile Number</label>
            <Input
              value={form.mobile ?? ""}
              onChange={(e) => onChange("mobile", e.target.value)}
              className="h-11 rounded-2xl"
              placeholder="077 123 4567"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input
              value={form.email ?? ""}
              onChange={(e) => onChange("email", e.target.value)}
              className="h-11 rounded-2xl"
              placeholder="guest@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Room Type</label>
            <Input
              value={form.roomType ?? ""}
              onChange={(e) => onChange("roomType", e.target.value)}
              className="h-11 rounded-2xl"
              placeholder="Deluxe Double"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Arrival Date</label>
            <Input
              type="date"
              value={form.arrivalDate ?? ""}
              onChange={(e) => onChange("arrivalDate", e.target.value)}
              className="h-11 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Departure Date</label>
            <Input
              type="date"
              value={form.departureDate ?? ""}
              onChange={(e) => onChange("departureDate", e.target.value)}
              className="h-11 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nights</label>
            <div className="flex h-11 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900">
              {nights}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Room No.</label>
            <Input
              value={form.roomNo ?? ""}
              onChange={(e) => onChange("roomNo", e.target.value)}
              className="h-11 rounded-2xl"
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Adults</label>
            <Input
              type="number"
              min="1"
              value={String(form.adults ?? 1)}
              onChange={(e) => onChange("adults", Number(e.target.value))}
              className="h-11 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Children</label>
            <Input
              type="number"
              min="0"
              value={String(form.children ?? 0)}
              onChange={(e) => onChange("children", Number(e.target.value))}
              className="h-11 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Board Basis</label>
            <select
              value={form.boardBasis ?? "Room Only"}
              onChange={(e) => onChange("boardBasis", e.target.value as ReservationPayload["boardBasis"])}
              className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {boardBasisOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Advance Payment</label>
            <Input
              type="number"
              min="0"
              value={String(form.advancePayment ?? 0)}
              onChange={(e) => onChange("advancePayment", Number(e.target.value))}
              className="h-11 rounded-2xl"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Estimated Value</label>
            <Input
              type="number"
              min="0"
              value={String(form.totalEstimate ?? 0)}
              onChange={(e) => onChange("totalEstimate", Number(e.target.value))}
              className="h-11 rounded-2xl"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              value={form.status ?? "Tentative"}
              onChange={(e) => onChange("status", e.target.value as ReservationPayload["status"])}
              className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {reservationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Notes</label>
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => onChange("notes", e.target.value)}
            className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400"
            placeholder="Special requests, transport note, meal requirement, room preference..."
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
            {mode === "create" ? "Save Reservation" : "Update Reservation"}
          </Button>
          <Button type="button" variant="outline" className="rounded-2xl bg-white" onClick={onReset}>
            Reset Form
          </Button>
        </div>
      </form>
    </PanelShell>
  );
}
