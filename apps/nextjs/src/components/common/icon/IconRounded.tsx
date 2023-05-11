/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react'
import { type ColorKey } from '../../../interfaces'
import { colorsBgLight, colorsText } from '../../../config/colors'
import BaseIcon from './BaseIcon'
import { IconMap } from '../../../config/iconMap'

type Props = {
  icon?: string
  iconName?: string
  href?: string
  color: ColorKey
  w?: string
  h?: string
  bg?: boolean
  className?: string
}

export default function IconRounded({
  icon,
  iconName,
  href,
  color,
  w = 'w-12',
  h = 'h-12',
  bg = false,
  className = '',
}: Props) {
  const classAddon = bg ? colorsBgLight[color] : `${colorsText[color]} bg-gray-50 dark:bg-slate-800`
  const path = icon ?? IconMap[iconName]

  return (
    <BaseIcon
      path={path}
      href={href}
      w={w}
      h={h}
      size="24"
      className={`rounded-full ${classAddon} ${className}`}
    />
  )
}
