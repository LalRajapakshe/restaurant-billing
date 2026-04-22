import AppShell from "@/components/layout/app-shell";
import ModulePlaceholder from "@/components/layout/module-placeholder";

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      description="Sprint 1 placeholder for rooms, outlets, board basis, payment methods, and system setup."
    >
      <ModulePlaceholder
        heading="Settings Module Foundation"
        intro="This module will define the master data and operating configuration required by hotel, restaurant, and housekeeping workflows."
        scope={[
          "Room master and room-type setup",
          "Outlet / income center setup",
          "Board basis and meal-plan setup",
          "Payment methods and tax/service charge setup",
          "User roles and integration settings later",
        ]}
        nextDeliverables={[
          "Master-data screen list by setting type",
          "Settings mock API routes and contracts",
          "Operational configuration validation rules",
          "ERP integration placeholder alignment",
        ]}
      />
    </AppShell>
  );
}
