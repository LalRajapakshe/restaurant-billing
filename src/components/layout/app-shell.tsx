"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BedDouble,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Hotel,
  LayoutDashboard,
  Menu,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";

import styles from "@/components/layout/app-shell.module.css";

type AppShellProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  showHeader?: boolean;
  fullBleed?: boolean;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/front-office", label: "Front Office", icon: Hotel },
  { href: "/frontdesk", label: "Restaurant Billing", icon: UtensilsCrossed },
  { href: "/housekeeping", label: "Housekeeping", icon: ClipboardCheck },
];

const STORAGE_KEY = "hotel-shell-sidebar-collapsed";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function AppShell({
  title = "Hotel Operations",
  description,
  children,
  showHeader = true,
  fullBleed = false,
}: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "1") {
        setCollapsed(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const activeNav = useMemo(() => {
    return NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? null;
  }, [pathname]);

  function renderNav(isMobile = false) {
    return (
      <div className="flex h-full flex-col">
        <div
          className={cx(
            "flex items-center gap-3 border-b border-white/10 px-4 py-4",
            collapsed && !isMobile ? "justify-center px-3" : ""
          )}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>

          {(!collapsed || isMobile) ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">Hotel Operations</p>
              <p className="truncate text-xs text-slate-300">Live operational workspace</p>
            </div>
          ) : null}

          {isMobile ? (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className={cx("flex-1 overflow-y-auto px-3 py-4", styles.sidebarScroll)}>
          <div className="mb-3 px-2">
            {(!collapsed || isMobile) ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Navigation
              </p>
            ) : null}
          </div>

          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed && !isMobile ? item.label : undefined}
                  className={cx(
                    "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition",
                    collapsed && !isMobile ? "justify-center px-2" : "",
                    isActive
                      ? "border-white/15 bg-white text-slate-950 shadow-sm"
                      : "border-transparent bg-white/5 text-slate-200 hover:border-white/10 hover:bg-white/10"
                  )}
                >
                  <Icon className={cx("h-5 w-5 shrink-0", isActive ? "text-slate-900" : "text-slate-200")} />
                  {(!collapsed || isMobile) ? (
                    <span className="truncate font-medium">{item.label}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-3">
            {(!collapsed || isMobile) ? (
              <>
                <p className="text-sm font-medium text-white">Current module</p>
                <p className="mt-1 text-xs text-slate-300">
                  {activeNav?.label ?? "Operations"}
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <BedDouble className="h-5 w-5 text-slate-200" />
                <button
                  type="button"
                  onClick={() => setCollapsed(false)}
                  title="Expand menu"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white hover:bg-white/15"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className={cx(
              "hidden w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-white hover:bg-white/10 lg:flex",
              collapsed ? "px-2" : ""
            )}
            title={collapsed ? "Expand menu" : "Collapse menu"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed ? <span>Collapse menu</span> : null}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cx(styles.shellRoot, "min-h-screen text-slate-900")}>
      <div className="flex min-h-screen">
        <aside
          className={cx(
            "hidden border-r border-white/10 bg-slate-950/95 text-white shadow-2xl backdrop-blur lg:flex lg:sticky lg:top-0 lg:h-screen",
            collapsed ? "w-24" : "w-80"
          )}
        >
          {renderNav(false)}
        </aside>

        {mobileOpen ? (
          <>
            <div
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-80 border-r border-white/10 bg-slate-950/95 text-white shadow-2xl backdrop-blur lg:hidden">
              {renderNav(true)}
            </aside>
          </>
        ) : null}

        <main className="min-w-0 flex-1">
          {showHeader ? (
            <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
              <div className="flex items-center gap-3 px-4 py-4 md:px-6">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xl font-semibold tracking-tight text-slate-950">
                    {title}
                  </p>
                  {description ? (
                    <p className="mt-1 truncate text-sm text-slate-500">{description}</p>
                  ) : null}
                </div>

                <div className="hidden shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm md:flex">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Live workflow
                </div>
              </div>
            </div>
          ) : null}

          {!showHeader ? (
            <div className="border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl lg:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          ) : null}

          <div
            className={cx(
              fullBleed ? "px-0 py-0" : "px-4 py-6 md:px-6",
              !fullBleed && styles.contentScroll
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
