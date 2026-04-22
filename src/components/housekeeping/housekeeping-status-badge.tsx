import { HousekeepingTaskStatus } from "@/types/housekeeping";

type HousekeepingStatusBadgeProps = {
  status: HousekeepingTaskStatus;
};

function classesForStatus(status: HousekeepingTaskStatus) {
  switch (status) {
    case "Dirty":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Cleaning In Progress":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "Ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function HousekeepingStatusBadge({
  status,
}: HousekeepingStatusBadgeProps) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${classesForStatus(status)}`}>
      {status}
    </span>
  );
}
