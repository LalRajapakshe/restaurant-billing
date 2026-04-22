import AppShell from "@/components/layout/app-shell";
import ExistingRestaurantBillingPage from "@/app/frontdesk/page";

export default function RestaurantBillingPage() {
  return (
    <AppShell showHeader={false} fullBleed>
      <ExistingRestaurantBillingPage />
    </AppShell>
  );
}
