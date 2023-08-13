import React from "react";
import { UserButton } from "@clerk/nextjs";

import { BreadCrumb } from "~/components/common/nav/BreadCrumb";

export default function NavBar() {
  return (
    <header className="border-gray-150 w-full border-0 bg-gray-50 dark:border-gray-600 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between p-4">
        <div className={"flex items-center"}>
          <BreadCrumb></BreadCrumb>
        </div>
        <UserButton />
      </div>
    </header>
  );
}
