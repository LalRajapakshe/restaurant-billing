'use client';

interface BillCardProps {
  billId: string;
  tableNumber: number;
  totalAmount: number;
  itemCount: number;
}

export function BillCard({ billId, tableNumber, totalAmount, itemCount }: BillCardProps) {
  return (
    <div className="rounded-lg border p-4 bg-white hover:shadow-md transition-shadow">
      <p className="text-sm text-muted-foreground">Table {tableNumber}</p>
      <p className="text-2xl font-bold mt-2">₹{totalAmount}</p>
      <p className="text-xs text-muted-foreground mt-2">{itemCount} items</p>
    </div>
  );
}
