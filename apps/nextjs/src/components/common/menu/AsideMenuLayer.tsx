import React from "react";
import Image from "next/image";
import { mdiClose } from "@mdi/js";

import { useElectron } from "~/hooks/useElectron";
import { type MenuAsideItem } from "../../../interfaces";
import { useAppSelector } from "../../../stores/hooks";
import BaseIcon from "../icon/BaseIcon";
import AsideMenuList from "./AsideMenuList";

type Props = {
  menu: MenuAsideItem[];
  className?: string;
  onAsideLgCloseClick: () => void;
};

export default function AsideMenuLayer({
  menu,
  className = "",
  ...props
}: Props) {
  const isElectron = useElectron();
  const asideStyle = useAppSelector((state) => state.style.asideStyle);
  const asideBrandStyle = useAppSelector(
    (state) => state.style.asideBrandStyle,
  );
  const asideScrollbarsStyle = useAppSelector(
    (state) => state.style.asideScrollbarsStyle,
  );
  const darkMode = useAppSelector((state) => state.style.darkMode);

  const handleAsideLgCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    props.onAsideLgCloseClick();
  };

  return (
    <aside
      className={`${className} zzz fixed top-0 z-40 flex h-screen w-60 overflow-hidden transition-position`}
    >
      <div
        className={`flex flex-1 flex-col overflow-hidden dark:bg-slate-900 lg:rounded-2xl ${
          isElectron ? "bg-transparent" : "bg-white"
        }`}
      >
        <div
          className={`flex h-14 flex-row items-center justify-between dark:bg-slate-900 ${asideBrandStyle}`}
        >
          {!isElectron && (
            <div className="flex flex-1 justify-center align-middle lg:pl-6 lg:text-left xl:pl-0 xl:text-center">
              <Image
                src="/logo/svg/logo-no-background.svg"
                width={150}
                height={150}
                alt="logo"
              />
            </div>
          )}
          <button
            aria-label="close"
            className="hidden p-3 lg:inline-block xl:hidden"
            onClick={handleAsideLgCloseClick}
          >
            <BaseIcon path={mdiClose} />
          </button>
        </div>
        <div
          className={`mt-5 flex-1 overflow-y-auto overflow-x-hidden ${
            darkMode ? "aside-scrollbars-[slate]" : asideScrollbarsStyle
          }`}
        >
          <AsideMenuList menu={menu} />
        </div>
        {/*<ul>*/}
        {/*  <AsideMenuItem item={logoutItem} />*/}
        {/*</ul>*/}
      </div>
    </aside>
  );
}
