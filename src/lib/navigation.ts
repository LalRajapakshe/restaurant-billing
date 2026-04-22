import {
  BarChart3,
  BedDouble,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overall operational summary",
  },
  {
    label: "Reservations",
    href: "/reservations",
    icon: ClipboardList,
    description: "Manage booking requests and confirmed stays",
  },
  {
    label: "Front Office",
    href: "/front-office",
    icon: BedDouble,
    description: "Room allocation, in-house guests, and checkout",
  },
  {
    label: "Restaurant Billing",
    href: "/restaurant-billing",
    icon: UtensilsCrossed,
    description: "Outlet billing, KOT/BOT, and hotel guest posting",
  },
  {
    label: "Housekeeping",
    href: "/housekeeping",
    icon: ShoppingBag,
    description: "Dirty rooms, cleaning actions, and room readiness",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    description: "Operational and management reports",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System setup, outlets, rooms, and payment methods",
  },
];
