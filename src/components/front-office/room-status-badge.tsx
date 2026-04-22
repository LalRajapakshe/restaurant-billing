import { RoomStatus } from "@/types/room";

type RoomStatusBadgeProps = {
  status: RoomStatus;
};

function classesForStatus(status: RoomStatus) {
  switch (status) {
    case "Vacant Ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Reserved":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "Occupied":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "Dirty":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Cleaning In Progress":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "Out of Order":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${classesForStatus(status)}`}>
      {status}
    </span>
  );
}
