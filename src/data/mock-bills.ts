type BillType = "KOT" | "BOT";

type BillItem = {
  name: string;
  qty: number;
  amount: number;
};

type Bill = {
  billNo: string;
  type: BillType;
  amount: number;
  paid: number;
  balance: number;
  createdAt: string;
  items: BillItem[];
};

export const mockBillsByJob: Record<string, Bill[]> = {
  "JOB-24031": [
    {
      billNo: "BILL-90121",
      type: "KOT",
      amount: 8350,
      paid: 7000,
      balance: 1350,
      createdAt: "12:30 PM",
      items: [
        { name: "Chicken Fried Rice", qty: 2, amount: 2400 },
        { name: "Devilled Chicken", qty: 1, amount: 1900 },
        { name: "Mineral Water", qty: 4, amount: 800 },
        { name: "VAT + Service", qty: 1, amount: 3250 },
      ],
    },
    {
      billNo: "BILL-90128",
      type: "BOT",
      amount: 4500,
      paid: 2000,
      balance: 2500,
      createdAt: "12:45 PM",
      items: [
        { name: "Fresh Lime", qty: 2, amount: 1200 },
        { name: "Mojito", qty: 2, amount: 2200 },
        { name: "Ice Cream", qty: 1, amount: 1100 },
      ],
    },
  ],
  "JOB-24032": [
    {
      billNo: "BILL-90131",
      type: "KOT",
      amount: 6400,
      paid: 0,
      balance: 6400,
      createdAt: "12:50 PM",
      items: [
        { name: "Seafood Nasi Goreng", qty: 2, amount: 3600 },
        { name: "Coke", qty: 2, amount: 800 },
        { name: "VAT + Service", qty: 1, amount: 2000 },
      ],
    },
  ],
  "JOB-24033": [
    {
      billNo: "BILL-90135",
      type: "KOT",
      amount: 9400,
      paid: 9400,
      balance: 0,
      createdAt: "1:10 PM",
      items: [
        { name: "Lunch Buffet", qty: 4, amount: 7600 },
        { name: "VAT + Service", qty: 1, amount: 1800 },
      ],
    },
    {
      billNo: "BILL-90136",
      type: "BOT",
      amount: 5300,
      paid: 5000,
      balance: 300,
      createdAt: "1:18 PM",
      items: [
        { name: "Fresh Juice", qty: 5, amount: 3500 },
        { name: "Dessert", qty: 2, amount: 1800 },
      ],
    },
    {
      billNo: "BILL-90137",
      type: "KOT",
      amount: 7400,
      paid: 7400,
      balance: 0,
      createdAt: "1:25 PM",
      items: [
        { name: "Grilled Fish", qty: 2, amount: 5200 },
        { name: "Rice", qty: 2, amount: 1200 },
        { name: "VAT + Service", qty: 1, amount: 1000 },
      ],
    },
  ],
  "JOB-24034": [
    {
      billNo: "BILL-90139",
      type: "BOT",
      amount: 5200,
      paid: 1500,
      balance: 3700,
      createdAt: "1:28 PM",
      items: [
        { name: "Milkshake", qty: 3, amount: 2100 },
        { name: "Mocktail", qty: 2, amount: 1800 },
        { name: "Snacks", qty: 1, amount: 1300 },
      ],
    },
  ],
  "JOB-24035": [
    {
      billNo: "BILL-90141",
      type: "KOT",
      amount: 26500,
      paid: 18000,
      balance: 8500,
      createdAt: "1:36 PM",
      items: [
        { name: "Party Set Menu", qty: 1, amount: 18000 },
        { name: "Extra Portions", qty: 5, amount: 4500 },
        { name: "VAT + Service", qty: 1, amount: 4000 },
      ],
    },
    {
      billNo: "BILL-90142",
      type: "BOT",
      amount: 11400,
      paid: 8000,
      balance: 3400,
      createdAt: "1:40 PM",
      items: [
        { name: "Signature Mocktails", qty: 6, amount: 5400 },
        { name: "Fresh Juice", qty: 4, amount: 2400 },
        { name: "Dessert Shots", qty: 6, amount: 3600 },
      ],
    },
    {
      billNo: "BILL-90143",
      type: "KOT",
      amount: 6200,
      paid: 4000,
      balance: 2200,
      createdAt: "1:42 PM",
      items: [
        { name: "Kids Meal", qty: 4, amount: 4800 },
        { name: "Ice Cream", qty: 4, amount: 1400 },
      ],
    },
    {
      billNo: "BILL-90144",
      type: "BOT",
      amount: 4500,
      paid: 0,
      balance: 4500,
      createdAt: "1:45 PM",
      items: [
        { name: "Coffee", qty: 10, amount: 3000 },
        { name: "Tea", qty: 5, amount: 1500 },
      ],
    },
  ],
  "JOB-24036": [
    {
      billNo: "BILL-90145",
      type: "KOT",
      amount: 3900,
      paid: 0,
      balance: 3900,
      createdAt: "1:46 PM",
      items: [
        { name: "String Hopper Kottu", qty: 2, amount: 2200 },
        { name: "Lime Juice", qty: 2, amount: 1000 },
        { name: "VAT + Service", qty: 1, amount: 700 },
      ],
    },
  ],
};

export const mockBills: Bill[] = Object.values(mockBillsByJob).flat();