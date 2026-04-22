export type MetricPoint = {
  name: string;
  value: number;
};

export type ModuleHealth = {
  name: string;
  route: string;
  status: "Ready for Demo" | "In Progress";
  summary: string;
};

export type ManagementSummary = {
  topLine: {
    totalReservations: number;
    arrivalsToday: number;
    inHouseGuests: number;
    openRestaurantJobs: number;
    dirtyRooms: number;
    todayRevenue: number;
    outstandingBalance: number;
    activeOutlets: number;
  };
  occupancyMix: MetricPoint[];
  reservationPipeline: MetricPoint[];
  housekeepingFlow: MetricPoint[];
  outletRevenue: MetricPoint[];
  modules: ModuleHealth[];
};
