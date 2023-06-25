import React, { useState, type ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { mdiClose, mdiDotsVertical } from "@mdi/js";

import { type MenuNavBarItem } from "../../../interfaces";
import BaseIcon from "../icon/BaseIcon";
import NavBarItemPlain from "./NavBarItemPlain";

type Props = {
  menu: MenuNavBarItem[];
  className: string;
  children: ReactNode;
};

export default function NavBar({ menu, className = "", children }: Props) {
  const [isMenuNavBarActive, setIsMenuNavBarActive] = useState(false);

  const handleMenuNavBarToggleClick = () => {
    setIsMenuNavBarActive(!isMenuNavBarActive);
  };

  return (
    <nav
      className={`${className} fixed inset-x-0 top-0 z-30 h-14 w-screen bg-gray-50 transition-position dark:bg-slate-800 lg:w-auto`}
    >
      <div className={`flex bg-gray-50  lg:items-stretch`}>
        <div className="flex h-14 flex-1 items-stretch">{children}</div>
        <div className="flex h-14 flex-none items-stretch lg:hidden">
          <NavBarItemPlain onClick={handleMenuNavBarToggleClick}>
            <BaseIcon
              path={isMenuNavBarActive ? mdiClose : mdiDotsVertical}
              size="24"
            />
          </NavBarItemPlain>
        </div>
        <div
          className={`${
            isMenuNavBarActive ? "block" : "hidden"
          } absolute left-0 top-14 max-h-screen-menu w-screen items-center overflow-y-auto bg-gray-50 p-2 shadow-lg dark:bg-slate-800 lg:static lg:flex lg:w-auto lg:overflow-visible lg:shadow-none`}
        >
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
