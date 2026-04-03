'use client';

export function BillItemsTable() {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-2 text-left">Item</th>
            <th className="px-4 py-2 text-right">Qty</th>
            <th className="px-4 py-2 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {/* TODO: Add table rows */}
        </tbody>
      </table>
    </div>
  );
}
