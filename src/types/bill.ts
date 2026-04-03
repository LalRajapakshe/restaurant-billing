export interface Bill {
  id: string;
  tableNumber: number;
  items: number;
  total: number;
  status: 'paid' | 'pending';
  createdAt: Date;
  updatedAt?: Date;
}

export interface BillItem {
  id: string;
  billId: string;
  itemName: string;
  quantity: number;
  price: number;
}
