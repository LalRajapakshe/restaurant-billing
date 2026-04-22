"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChefHat, UtensilsCrossed, Wine } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GuestType, RestaurantBillType } from "@/types/restaurant";

type JobStatus = "Open" | "Partially Paid" | "Ready to Close" | "Closed";

export type FrontdeskJobCardData = {
  id: string;
  table: string;
  mobile: string;
  customer: string;
  openedAt: string;
  bills: number;
  typeMix: RestaurantBillType[];
  subtotal: number;
  paid: number;
  balance: number;
  status: JobStatus;
  guestType: GuestType;
  outlet: string;
  roomNo?: string;
};

function currency(value: number) {
  return `LKR ${value.toLocaleString()}`;
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

function BillTypeBadge({ type }: { type: RestaurantBillType }) {
  if (type === "KOT") {
    return (
      <Badge className="bg-teal-600 hover:bg-teal-600">
        <ChefHat className="mr-1 h-3.5 w-3.5" />
        {type}
      </Badge>
    );
  }

  if (type === "BOT") {
    return (
      <Badge className="bg-violet-600 hover:bg-violet-600">
        <Wine className="mr-1 h-3.5 w-3.5" />
        {type}
      </Badge>
    );
  }

  return (
    <Badge className="bg-amber-600 hover:bg-amber-600">
      <UtensilsCrossed className="mr-1 h-3.5 w-3.5" />
      {type}
    </Badge>
  );
}

type JobCardProps = {
  job: FrontdeskJobCardData;
  active: boolean;
  onSelect: () => void;
};

export default function JobCard({ job, active, onSelect }: JobCardProps) {
  const progress = job.subtotal > 0 ? Math.round((job.paid / job.subtotal) * 100) : 0;

  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onSelect}
      className={`w-full rounded-3xl border p-4 text-left shadow-sm transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                active ? "border-white/15 bg-white/10 text-white" : statusClasses(job.status)
              }`}
            >
              {job.status}
            </span>
            <span className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>{job.id}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs ${active ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}`}>
              {job.guestType}
            </span>
          </div>
          <h3 className={`mt-3 text-lg font-semibold ${active ? "text-white" : "text-slate-900"}`}>
            {job.table}
          </h3>
          <p className={`text-sm ${active ? "text-slate-300" : "text-slate-500"}`}>{job.customer}</p>
          <p className={`mt-1 text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
            {job.outlet}{job.roomNo ? ` • Room ${job.roomNo}` : ""}
          </p>
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
          <p className={`mt-1 font-medium ${active ? "text-white" : "text-slate-900"}`}>{job.mobile || "-"}</p>
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
