import { ReservationStatus } from "@/types/reservation";

type ReservationStatusBadgeProps = {
  status: ReservationStatus;
};

function classesForStatus(status: ReservationStatus) {
  switch (status) {
    case "Checked In":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Checked Out":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "Confirmed":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "Tentative":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Cancelled":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "No Show":
      return "border-violet-200 bg-violet-50 text-violet-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function ReservationStatusBadge({
  status,
}: ReservationStatusBadgeProps) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${classesForStatus(status)}`}>
      {status}
    </span>
  );
}
