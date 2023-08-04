import React, { useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  mdiAccountCash,
  mdiBackburger,
  mdiBank,
  mdiCashMultiple,
  mdiChartBar,
  mdiCog,
  mdiMenu,
  mdiMonitor,
  mdiPiggyBank,
  mdiWallet,
} from "@mdi/js";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import LoadingBar from "react-top-loading-bar";

import { TopLoadingBarStateContext } from "~/utils/contexts";
import BaseIcon from "~/components/common/icon/BaseIcon";
import NavBar from "./common/nav/NavBar";

type Props = {
  children: ReactNode;
};

export default function LayoutAuthenticated({ children }: Props) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const loadingBarRef = useRef();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const showLoadingBar: () => void = loadingBarRef.current?.continuousStart;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const hideLoadingBar: () => void = loadingBarRef.current?.complete;

  return (
    <div className={"flex"}>
      <aside className={"sticky top-0 h-screen"}>
        <Sidebar collapsed={isCollapsed} className={"absolute max-h-screen"}>
          <div>
            <div
              className={`mt-5 flex min-w-full ${
                !isCollapsed ? "justify-between" : "justify-center"
              } p-2`}
            >
              {!isCollapsed && (
                <div className={"pl-6"}>
                  <Image
                    src="/logo/svg/logo-no-background.svg"
                    width={150}
                    height={150}
                    alt="logo"
                  />
                </div>
              )}
              <div onClick={() => setIsCollapsed(!isCollapsed)}>
                <BaseIcon
                  path={isCollapsed ? mdiMenu : mdiBackburger}
                  size={48}
                />
              </div>
            </div>
            <div className={"mt-6"}>
              <Menu
                closeOnClick
                menuItemStyles={{
                  button: ({ level, active, disabled }) => {
                    // only apply styles on first level elements of the tree
                    if (level === 0)
                      return {
                        backgroundColor: active ? "#c1c1c1" : "white",
                        color: active ? "black" : "black",
                      };
                  },
                }}
              >
                <MenuItem
                  component={<Link href={"/"}></Link>}
                  icon={<BaseIcon path={mdiMonitor} />}
                  active={router.pathname === "/"}
                >
                  Dashboard
                </MenuItem>
                <MenuItem
                  component={<Link href={"/transactions"}></Link>}
                  icon={<BaseIcon path={mdiCashMultiple} />}
                  active={router.pathname === "/transactions"}
                >
                  Transactions
                </MenuItem>
                <MenuItem
                  component={<Link href={"/accounts"}></Link>}
                  icon={<BaseIcon path={mdiBank} />}
                  active={router.pathname === "/accounts"}
                >
                  Accounts
                </MenuItem>
                <MenuItem
                  component={<Link href={"/budget"}></Link>}
                  icon={<BaseIcon path={mdiWallet} />}
                  active={router.pathname === "/budget"}
                >
                  Budget
                </MenuItem>
                <MenuItem
                  component={<Link href={"/payees"}></Link>}
                  icon={<BaseIcon path={mdiAccountCash} />}
                  active={router.pathname === "/payees"}
                >
                  Payees
                </MenuItem>
                <MenuItem
                  component={<Link href={"/investment"}></Link>}
                  icon={<BaseIcon path={mdiPiggyBank} />}
                  active={router.pathname === "/investment"}
                >
                  Investments
                </MenuItem>
                <MenuItem
                  component={<Link href={"/analytics"}></Link>}
                  icon={<BaseIcon path={mdiChartBar} />}
                  active={router.pathname === "/analytics"}
                >
                  Analytics
                </MenuItem>
                <MenuItem
                  component={<Link href={"/settings"}></Link>}
                  icon={<BaseIcon path={mdiCog} />}
                  active={router.pathname === "/settings"}
                >
                  Settings
                </MenuItem>
              </Menu>
            </div>
          </div>
        </Sidebar>
      </aside>
      <main className={"min-h-screen w-screen overflow-hidden"}>
        <LoadingBar height={6} color="black" ref={loadingBarRef} />
        <NavBar></NavBar>
        <TopLoadingBarStateContext.Provider
          value={{ show: showLoadingBar, hide: hideLoadingBar }}
        >
          {children}
        </TopLoadingBarStateContext.Provider>
      </main>
    </div>
  );
  // ) : (
  //
  // )
}
