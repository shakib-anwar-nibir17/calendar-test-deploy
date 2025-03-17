import { ROUTES } from "@/utils/routes";
import {
  Calendar,
  GraduationCap,
  LayoutGrid,
  LucideIcon,
  Wallet2,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: ROUTES.DASHBOARD,
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: [],
        },
        {
          href: ROUTES.PLATFORMS,
          label: "Platforms",
          icon: GraduationCap,
          submenus: [],
        },
        {
          href: ROUTES.SCHEDULE,
          label: "Schedule",
          icon: Calendar,
          submenus: [],
        },
        {
          href: ROUTES.PAYMENT,
          label: "Payment",
          icon: Wallet2,
          submenus: [],
        },
      ],
    },
  ];
}
