import {
  mdiAccountCash,
  mdiBank,
  mdiCashMultiple,
  mdiChartBar,
  mdiCog,
  mdiMonitor,
  mdiPiggyBank,
  mdiWallet,
} from "@mdi/js";

import { type MenuAsideItem } from "~/interfaces";

const menuAside: MenuAsideItem[] = [
  {
    href: "/",
    icon: mdiMonitor,
    label: "Dashboard",
  },
  {
    label: "Transactions",
    icon: mdiCashMultiple,
    href: "/transactions",
  },
  {
    href: "/accounts",
    label: "Accounts",
    icon: mdiBank,
  },
  {
    href: "/budget",
    label: "Budget",
    icon: mdiWallet,
  },
  {
    href: "/payees",
    label: "Payees",
    icon: mdiAccountCash,
  },
  {
    href: "/investment",
    label: "Investments",
    icon: mdiPiggyBank,
  },

  {
    href: "analytics",
    label: "Analytics",
    icon: mdiChartBar,
  },
  {
    href: "settings",
    label: "Settings",
    icon: mdiCog,
  },
];

export default menuAside;
