import React, { type ReactNode, useState } from 'react'
import { mdiClose, mdiDotsVertical } from '@mdi/js'
import { containerMaxW } from '../../../config/config'
import BaseIcon from '../icon/BaseIcon'
import NavBarItemPlain from './NavBarItemPlain'
import NavBarMenuList from './NavBarMenuList'
import { type MenuNavBarItem } from '../../../interfaces'
import {
  UserButton
} from "@clerk/nextjs";

type Props = {
  menu: MenuNavBarItem[]
  className: string
  children: ReactNode
}

export default function NavBar({ menu, className = '', children }: Props) {
  const [isMenuNavBarActive, setIsMenuNavBarActive] = useState(false)

  const handleMenuNavBarToggleClick = () => {
    setIsMenuNavBarActive(!isMenuNavBarActive)
  }

  return (
    <nav
      className={`${className} fixed inset-x-0 top-0 z-30 h-14 w-screen bg-gray-50 transition-position dark:bg-slate-800 lg:w-auto`}
    >
      <div className={`flex lg:items-stretch ${containerMaxW}`}>
        <div className="flex h-14 flex-1 items-stretch">{children}</div>
        <div className="flex h-14 flex-none items-stretch lg:hidden">
          <NavBarItemPlain onClick={handleMenuNavBarToggleClick}>
            <BaseIcon path={isMenuNavBarActive ? mdiClose : mdiDotsVertical} size="24" />
          </NavBarItemPlain>
        </div>
        <div
          className={`${
            isMenuNavBarActive ? 'block' : 'hidden'
          } absolute items-center p-2 left-0 top-14 max-h-screen-menu w-screen overflow-y-auto bg-gray-50 shadow-lg dark:bg-slate-800 lg:static lg:flex lg:w-auto lg:overflow-visible lg:shadow-none`}
        >
          <UserButton />
        </div>
      </div>
    </nav>
  )
}
