import { mockBills } from "@/data/mock-bills";
import { mockJobs } from "@/data/mock-jobs";

const totalSales = mockBills.reduce((sum, bill) => sum + bill.amount, 0);
const totalPaid = mockBills.reduce((sum, bill) => sum + bill.paid, 0);
const totalOutstanding = mockBills.reduce((sum, bill) => sum + bill.balance, 0);
const kotSales = mockBills.filter((bill) => bill.type === "KOT").reduce((sum, bill) => sum + bill.amount, 0);
const botSales = mockBills.filter((bill) => bill.type === "BOT").reduce((sum, bill) => sum + bill.amount, 0);

export const mockDashboard = {
  summary: {
    totalSales,
    totalPaid,
    totalOutstanding,
    openJobs: mockJobs.length,
    availableTables: 14,
    kotSales,
    botSales,
  },
  salesTrend: [
    { hour: "10AM", sales: 18000 },
    { hour: "11AM", sales: 26000 },
    { hour: "12PM", sales: 32000 },
    { hour: "1PM", sales: 41000 },
    { hour: "2PM", sales: 28000 },
    { hour: "3PM", sales: 22500 },
    { hour: "4PM", sales: 33800 },
    { hour: "5PM", sales: 47100 },
    { hour: "6PM", sales: 60100 },
  ],
  split: [
    { name: "KOT", value: kotSales },
    { name: "BOT", value: botSales },
  ],
};

