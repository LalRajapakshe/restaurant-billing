export type GuestType = "FIT" | "Room Guest";

export type RestaurantBillType = "KOT" | "BOT" | "Main Meal";

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "A la carte";

export type OutletRecord = {
    id: string;
    name: string;
    category: string;
};

export type FolioPostingRecord = {
    postingId: string;
    roomNo: string;
    guestName: string;
    outlet: string;
    sourceJobId: string;
    amount: number;
    postedAt: string;
    billingType: RestaurantBillType;
    mealType?: MealType | null;
};

export const guestTypes: GuestType[] = ["FIT", "Room Guest"];

export const restaurantBillTypes: RestaurantBillType[] = [
    "KOT",
    "BOT",
    "Main Meal",
];

export const mealTypes: MealType[] = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "A la carte",
];