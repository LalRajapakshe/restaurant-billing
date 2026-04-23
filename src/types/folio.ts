import { MealType, RestaurantBillType } from "@/types/restaurant";

export type FolioEntryType = "charge" | "payment";

export type FolioSourceModule = "room" | "restaurant" | "frontoffice";

export type FolioPaymentMethod = "Cash" | "Card" | "Transfer" | "System";

export type FolioEntry = {
  id: string;
  roomId: string;
  roomNo: string;
  guestName: string;
  reservationId: string;
  sourceModule: FolioSourceModule;
  sourceJobId?: string;
  sourceBillNo?: string;
  description: string;
  outlet?: string;
  entryType: FolioEntryType;
  debit: number;
  credit: number;
  postedAt: string;
  billingType?: RestaurantBillType;
  mealType?: MealType | null;
  paymentMethod?: FolioPaymentMethod | null;
  note?: string;
};

export function getFolioEntryNet(entry: FolioEntry) {
  return entry.debit - entry.credit;
}
