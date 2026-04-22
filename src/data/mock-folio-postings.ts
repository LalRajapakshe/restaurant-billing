import { FolioPostingRecord } from "@/types/restaurant";

export const mockFolioPostings: FolioPostingRecord[] = [
  {
    postingId: "FOL-7001",
    roomNo: "118",
    guestName: "Fernando Family",
    outlet: "Main Restaurant",
    sourceJobId: "JOB-24033",
    amount: 5300,
    postedAt: "2026-04-21T13:20:00.000Z",
    billingType: "BOT",
    mealType: null,
  },
  {
    postingId: "FOL-7002",
    roomNo: "301",
    guestName: "Lanka Travels Group",
    outlet: "Main Restaurant",
    sourceJobId: "JOB-24035",
    amount: 6200,
    postedAt: "2026-04-21T19:10:00.000Z",
    billingType: "Main Meal",
    mealType: "Dinner",
  },
];
