"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/lib/navigation";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/" || pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-200 bg-white md:min-h-screen md:w-72 md:border-b-0 md:border-r">
      <div className="border-b border-slate-200 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Hotel Operations
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          Unified Management
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sprint 1 application shell for hotel, restaurant, and housekeeping operations.
        </p>
      </div>

      <nav className="grid gap-2 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl border px-4 py-3 transition ${active
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-xl p-2 ${active ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${active ? "text-white" : "text-slate-900"}`}>
                    {item.label}
                  </p>
                  <p className={`mt-1 text-xs leading-5 ${active ? "text-slate-300" : "text-slate-500"}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
