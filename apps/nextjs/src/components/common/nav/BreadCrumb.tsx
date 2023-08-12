import { useRouter } from "next/router";
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

import IconRounded from "~/components/common/icon/IconRounded";

const getIconAndTitle = (path: string) => {
  switch (path) {
    case "/":
      return {
        icon: mdiMonitor,
        title: "Dashboard",
      };
    case "/accounts":
      return {
        icon: mdiBank,
        title: "Accounts",
      };
    case "/budget":
      return {
        icon: mdiWallet,
        title: "Budget",
      };
    case "/payees":
      return {
        icon: mdiAccountCash,
        title: "Payees",
      };
    case "/investment":
      return {
        icon: mdiPiggyBank,
        title: "Investments",
      };
    case "/analytics":
      return {
        icon: mdiChartBar,
        title: "Analytics",
      };
    case "/settings":
      return {
        icon: mdiCog,
        title: "Settings",
      };
    case "/transactions":
      return {
        icon: mdiCashMultiple,
        title: "Transactions",
      };
  }
};

const getSubtitle = (path: string, query: unknown) => {
  if (path === "/transactions") {
    if (Object.keys(query).length === 1 && query["import"]) {
      return "Import";
    }
  }
  return null;
};

export const BreadCrumb = () => {
  const router = useRouter();
  const { icon, title } = getIconAndTitle(router.pathname);
  const subtitle = getSubtitle(router.pathname, router.query);
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li
          className={`inline-flex ${
            subtitle ? "cursor-pointer" : ""
          } items-center`}
          onClick={subtitle ? () => router.back() : () => void 0}
        >
          <div
            className={`inline-flex items-center font-sans text-lg text-gray-700 ${
              subtitle ? "hover:text-blue-600 dark:hover:text-white" : ""
            } dark:text-gray-400 `}
          >
            <IconRounded color="contrast" icon={icon} />
            {title}
          </div>
        </li>
        {subtitle && (
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="mx-1 h-3 w-3 text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <span className="ml-1 font-sans text-lg text-gray-500 dark:text-gray-400 md:ml-2">
                {subtitle}
              </span>
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
};
