import AppShell from "@/components/layout/app-shell";
import ReportCategoryCard from "@/components/reports/report-category-card";
import { getManagementSummary } from "@/lib/management-summary";

function currency(value: number) {
  return `LKR ${value.toLocaleString()}`;
}

export default function ReportsPage() {
  const summary = getManagementSummary();

  const reportCards = [
    {
      title: "Reservation Reports",
      description:
        "Booking pipeline visibility for tentative, confirmed, checked-in, checked-out, cancelled, and no-show reservations.",
      items: [
        "Arrival list and departure list",
        "Reservation status summary",
        "Board basis and guest-count analysis",
        "Advance payment and estimate tracking",
      ],
      kpiLabel: "Reservations in system",
      kpiValue: String(summary.topLine.totalReservations),
    },
    {
      title: "Front Office Reports",
      description:
        "Operational room allocation and occupancy visibility across current in-house flow and turnover readiness.",
      items: [
        "Occupied / reserved / vacant room summary",
        "Room-type and floor-level occupancy view",
        "Checkout turnover and dirty-room handoff",
        "Daily room status snapshot",
      ],
      kpiLabel: "In-house rooms",
      kpiValue: String(summary.topLine.inHouseGuests),
    },
    {
      title: "Restaurant Reports",
      description:
        "Outlet billing overview with FIT and room-guest billing behavior reflected in management summaries.",
      items: [
        "Outlet revenue mix",
        "Open restaurant job summary",
        "Outstanding restaurant balance",
        "Room-guest folio-posting visibility",
      ],
      kpiLabel: "Restaurant revenue",
      kpiValue: currency(summary.topLine.todayRevenue),
    },
    {
      title: "Housekeeping Reports",
      description:
        "Room turnover performance from dirty to cleaning to ready, aligned with front office departure flow.",
      items: [
        "Dirty-room queue view",
        "Cleaning progress summary",
        "Ready-room completion list",
        "Cleaner assignment tracking",
      ],
      kpiLabel: "Dirty rooms",
      kpiValue: String(summary.topLine.dirtyRooms),
    },
    {
      title: "Management Snapshot",
      description:
        "Cross-module operational reporting for demonstration and management review in one landing page.",
      items: [
        "Dashboard-aligned KPI cards",
        "Occupancy and pipeline charts",
        "Outlet / revenue visibility",
        "Phase 1 readiness overview",
      ],
      kpiLabel: "Outstanding balance",
      kpiValue: currency(summary.topLine.outstandingBalance),
    },
    {
      title: "Stabilization Summary",
      description:
        "Phase 1 closing view to confirm all modules are reachable, visually aligned, and presentable to stakeholders.",
      items: [
        "Shared shell and navigation consistency",
        "Module readiness by sprint outcome",
        "Mock-to-real transition readiness",
        "Backlog items for Phase 2",
      ],
      kpiLabel: "Active outlets",
      kpiValue: String(summary.topLine.activeOutlets),
    },
  ];

  return (
    <AppShell
      title="Reports"
      description="Sprint 6 reports landing provides report categories, management-level summaries, and a Phase 1 stabilization view."
    >
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
        Reports now reflect data from Reservations, Front Office, Restaurant Billing, and Housekeeping mock summaries.
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((card) => (
          <ReportCategoryCard
            key={card.title}
            title={card.title}
            description={card.description}
            items={card.items}
            kpiLabel={card.kpiLabel}
            kpiValue={card.kpiValue}
          />
        ))}
      </div>
    </AppShell>
  );
}
