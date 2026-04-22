import * as React from "react";

import AppSidebar from "@/components/layout/app-sidebar";
import PageHeader from "@/components/layout/page-header";

type AppShellProps = {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  showHeader?: boolean;
  fullBleed?: boolean;
};

export default function AppShell({
  title,
  description,
  actions,
  children,
  showHeader = true,
  fullBleed = false,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="md:flex">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <main className={fullBleed ? "min-h-screen" : "min-h-screen p-4 md:p-6 lg:p-8"}>
            {showHeader && title ? (
              <PageHeader title={title} description={description} actions={actions} />
            ) : null}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
