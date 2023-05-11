import React, { useState } from 'react'
import Link from 'next/link'
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'
import BaseDivider from './BaseDivider'
import BaseIcon from '../icon/BaseIcon'
import UserAvatarCurrentUser from '../avatar/UserAvatarCurrentUser'
import NavBarMenuList from './NavBarMenuList'
import { useAppDispatch, useAppSelector } from '../../../stores/hooks'
import { type MenuNavBarItem } from '../../../interfaces'
import { setDarkMode } from '../../../stores/styleSlice'

type Props = {
  item: MenuNavBarItem
}

export default function NavBarItem({ item }: Props) {
  const dispatch = useAppDispatch()

  const navBarItemLabelActiveColorStyle = useAppSelector(
    (state) => state.style.navBarItemLabelActiveColorStyle
  )
  const navBarItemLabelStyle = useAppSelector((state) => state.style.navBarItemLabelStyle)
  const navBarItemLabelHoverStyle = useAppSelector((state) => state.style.navBarItemLabelHoverStyle)

  const userName = "Athul"

  const [isDropdownActive, setIsDropdownActive] = useState(false)

  const componentClass = [
    'block lg:flex items-center relative cursor-pointer',
    isDropdownActive
      ? `${navBarItemLabelActiveColorStyle} dark:text-slate-400`
      : `${navBarItemLabelStyle} dark:text-white dark:hover:text-slate-400 ${navBarItemLabelHoverStyle}`,
    item.menu ? 'lg:py-2 lg:px-3' : 'py-2 px-3',
    item.isDesktopNoLabel ? 'lg:w-16 lg:justify-center' : '',
  ].join(' ')

  const itemLabel = item.isCurrentUser ? userName : item.label

  const handleMenuClick = () => {
    if (item.menu) {
      setIsDropdownActive(!isDropdownActive)
    }

    if (item.isToggleLightDark) {
      dispatch(setDarkMode(null))
    }
  }

  const NavBarItemComponentContents = (
    <>
      <div
        className={`flex items-center ${
          item.menu
            ? 'bg-gray-100 p-3 dark:bg-slate-800 lg:bg-transparent lg:p-0 lg:dark:bg-transparent'
            : ''
        }`}
        onClick={handleMenuClick}
      >
        {item.isCurrentUser && <UserAvatarCurrentUser className="mr-3 inline-flex h-6 w-6" />}
        {item.icon && <BaseIcon path={item.icon} className="transition-colors" />}
        <span
          className={`px-2 transition-colors ${
            item.isDesktopNoLabel && item.icon ? 'lg:hidden' : ''
          }`}
        >
          {itemLabel}
        </span>
        {item.menu && (
          <BaseIcon
            path={isDropdownActive ? mdiChevronUp : mdiChevronDown}
            className="hidden transition-colors lg:inline-flex"
          />
        )}
      </div>
      {item.menu && (
        <div
          className={`${
            !isDropdownActive ? 'lg:hidden' : ''
          } border-b border-gray-100 text-sm dark:border-slate-700 lg:absolute lg:left-0 lg:top-full lg:z-20 lg:min-w-full lg:rounded-lg lg:border lg:bg-white lg:shadow-lg lg:dark:bg-slate-800`}
        >
          <NavBarMenuList menu={item.menu} />
        </div>
      )}
    </>
  )

  if (item.isDivider) {
    return <BaseDivider navBar />
  }

  if (item.href) {
    return (
      <Link href={item.href} target={item.target} className={componentClass}>
        {NavBarItemComponentContents}
      </Link>
    )
  }

  return <div className={componentClass}>{NavBarItemComponentContents}</div>
}
