'use client';

import Link from 'next/link';

export function AppSidebar() {
  return (
    <aside className="w-64 border-r bg-white">
      <nav className="p-4 space-y-2">
        <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-100">
          Dashboard
        </Link>
        <Link href="/frontdesk" className="block px-4 py-2 rounded hover:bg-gray-100">
          Front Desk
        </Link>
        <Link href="/reports" className="block px-4 py-2 rounded hover:bg-gray-100">
          Reports
        </Link>
        <Link href="/settings" className="block px-4 py-2 rounded hover:bg-gray-100">
          Settings
        </Link>
      </nav>
    </aside>
  );
}
