import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { mdiBackburger, mdiForwardburger, mdiMenu } from "@mdi/js";

import { useElectron } from "~/hooks/useElectron";
import menuAside from "../config/menuAside";
import menuNavBar from "../config/menuNavBar";
import { useAppDispatch, useAppSelector } from "../stores/hooks";
import BaseIcon from "./common/icon/BaseIcon";
import AsideMenu from "./common/menu/AsideMenu";
import NavBar from "./common/nav/NavBar";
import NavBarItemPlain from "./common/nav/NavBarItemPlain";

type Props = {
  children: ReactNode;
};

export default function LayoutAuthenticated({ children }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isElectron = useElectron();

  const darkMode = useAppSelector((state) => state.style.darkMode);

  const [isAsideMobileExpanded, setIsAsideMobileExpanded] = useState(false);
  const [isAsideLgActive, setIsAsideLgActive] = useState(false);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsAsideMobileExpanded(false);
      setIsAsideLgActive(false);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [router.events, dispatch]);

  const layoutAsidePadding = "xl:pl-60";

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } overflow-hidden lg:overflow-visible`}
    >
      <div
        className={`${layoutAsidePadding} ${
          isAsideMobileExpanded ? "ml-60 lg:ml-0" : ""
        } min-h-screen w-screen ${
          isElectron ? "bg-transparent" : "bg-gray-50"
        } pt-14 transition-position dark:bg-slate-800 dark:text-slate-100 lg:w-auto`}
      >
        <NavBar
          menu={menuNavBar}
          className={`bg-transparent ${layoutAsidePadding} ${
            isAsideMobileExpanded ? "ml-60 lg:ml-0" : ""
          }`}
        >
          <NavBarItemPlain
            display="flex lg:hidden"
            onClick={() => setIsAsideMobileExpanded(!isAsideMobileExpanded)}
          >
            <BaseIcon
              path={isAsideMobileExpanded ? mdiBackburger : mdiForwardburger}
              size="24"
            />
          </NavBarItemPlain>
          <NavBarItemPlain
            display="hidden lg:flex xl:hidden"
            onClick={() => setIsAsideLgActive(true)}
          >
            <BaseIcon path={mdiMenu} size="24" />
          </NavBarItemPlain>
        </NavBar>
        <AsideMenu
          isAsideMobileExpanded={isAsideMobileExpanded}
          isAsideLgActive={isAsideLgActive}
          menu={menuAside}
          onAsideLgClose={() => setIsAsideLgActive(false)}
        />
        {children}
      </div>
    </div>
  );
  // ) : (
  //
  // )
}
