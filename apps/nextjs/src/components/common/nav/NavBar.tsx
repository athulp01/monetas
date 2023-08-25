import React from "react";
import { UserButton } from "@clerk/nextjs";
import { mdiMenu } from "@mdi/js";

import BaseIcon from "~/components/common/icon/BaseIcon";
import { BreadCrumb } from "~/components/common/nav/BreadCrumb";

interface Props {
  isHambugerVisible?: boolean;
  onHamburgerClick?: () => void;
}
export default function NavBar(props: Props) {
  return (
    <header className="border-gray-150 w-full border-0 bg-gray-50 dark:border-gray-600 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between p-4">
        <div className={"flex items-center"}>
          {props?.isHambugerVisible && (
            <div
              onClick={props.onHamburgerClick}
              className={"flex items-center"}
            >
              <BaseIcon path={mdiMenu} size={48} />
            </div>
          )}
          <BreadCrumb></BreadCrumb>
        </div>
        <UserButton />
      </div>
    </header>
  );
}
