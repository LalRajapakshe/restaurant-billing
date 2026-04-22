import { mockBills, mockBillsByJob } from "@/data/mock-bills";
import { mockHousekeepingTasks } from "@/data/mock-housekeeping-tasks";
import { mockOutlets } from "@/data/mock-outlets";
import { mockReservations } from "@/data/mock-reservations";
import { mockRooms } from "@/data/mock-rooms";
import { ManagementSummary } from "@/types/management-summary";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getManagementSummary(): ManagementSummary {
  const today = todayIsoDate();

  const totalReservations = mockReservations.length;
  const arrivalsToday = mockReservations.filter((item) => item.arrivalDate === today).length;
  const inHouseGuests = mockRooms.filter((item) => item.status === "Occupied").length;
  const dirtyRooms = mockRooms.filter((item) => item.status === "Dirty").length;
  const activeOutlets = mockOutlets.length;
  const openRestaurantJobs = Object.keys(mockBillsByJob).length;
  const todayRevenue = mockBills.reduce((sum, bill) => sum + bill.amount, 0);
  const outstandingBalance = mockBills.reduce((sum, bill) => sum + bill.balance, 0);

  const occupancyMix = [
    { name: "Vacant Ready", value: mockRooms.filter((item) => item.status === "Vacant Ready").length },
    { name: "Reserved", value: mockRooms.filter((item) => item.status === "Reserved").length },
    { name: "Occupied", value: mockRooms.filter((item) => item.status === "Occupied").length },
    { name: "Dirty", value: mockRooms.filter((item) => item.status === "Dirty").length },
    { name: "Cleaning", value: mockRooms.filter((item) => item.status === "Cleaning In Progress").length },
    { name: "Out of Order", value: mockRooms.filter((item) => item.status === "Out of Order").length },
  ];

  const reservationPipeline = [
    { name: "Tentative", value: mockReservations.filter((item) => item.status === "Tentative").length },
    { name: "Confirmed", value: mockReservations.filter((item) => item.status === "Confirmed").length },
    { name: "Checked In", value: mockReservations.filter((item) => item.status === "Checked In").length },
    { name: "Checked Out", value: mockReservations.filter((item) => item.status === "Checked Out").length },
    { name: "Cancelled", value: mockReservations.filter((item) => item.status === "Cancelled").length },
    { name: "No Show", value: mockReservations.filter((item) => item.status === "No Show").length },
  ];

  const housekeepingFlow = [
    { name: "Dirty", value: mockHousekeepingTasks.filter((item) => item.status === "Dirty").length },
    { name: "Cleaning", value: mockHousekeepingTasks.filter((item) => item.status === "Cleaning In Progress").length },
    { name: "Ready", value: mockHousekeepingTasks.filter((item) => item.status === "Ready").length },
  ];

  const outletRevenue = [
    { name: "Main Restaurant", value: Math.round(todayRevenue * 0.52) },
    { name: "Pool Bar", value: Math.round(todayRevenue * 0.18) },
    { name: "Coffee Shop", value: Math.round(todayRevenue * 0.14) },
    { name: "Room Service", value: Math.round(todayRevenue * 0.16) },
  ];

  const modules = [
    {
      name: "Reservations",
      route: "/reservations",
      status: "Ready for Demo" as const,
      summary: "Arrival/departure dates, nights, board basis, guest counts, and status flow are in place.",
    },
    {
      name: "Front Office",
      route: "/front-office",
      status: "Ready for Demo" as const,
      summary: "Room allocation, stay updates, checkout, and dirty-room handoff are working in demo mode.",
    },
    {
      name: "Restaurant Billing",
      route: "/restaurant-billing",
      status: "Ready for Demo" as const,
      summary: "FIT vs Room Guest, outlet selection, Main Meal, and room-folio posting flow are active.",
    },
    {
      name: "Housekeeping",
      route: "/housekeeping",
      status: "Ready for Demo" as const,
      summary: "Dirty-room queue, cleaning progress, cleaner details, and ready-state updates are working.",
    },
    {
      name: "Reports",
      route: "/reports",
      status: "Ready for Demo" as const,
      summary: "Reports landing and management summaries are now available for Phase 1 presentation.",
    },
  ];

  return {
    topLine: {
      totalReservations,
      arrivalsToday,
      inHouseGuests,
      openRestaurantJobs,
      dirtyRooms,
      todayRevenue,
      outstandingBalance,
      activeOutlets,
    },
    occupancyMix,
    reservationPipeline,
    housekeepingFlow,
    outletRevenue,
    modules,
  };
}
