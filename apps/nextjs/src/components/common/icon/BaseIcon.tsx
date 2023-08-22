import React, { type ReactNode } from 'react'
import Image from 'next/image'

type Props = {
  path?: string
  href?: string
  w?: string
  h?: string
  size?: string | number | null
  className?: string
  children?: ReactNode
}

export default function BaseIcon({
  path,
  href,
  w = 'w-6',
  h = 'h-6',
  size = null,
  className = '',
  children,
}: Props) {
  const iconSize = size ?? 16

  return (
    <span className={`inline-flex items-center justify-center ${w} ${h} ${className}`}>
      {href && (
        <Image src={href} width={16} height={16} className="inline-block" alt="logo"></Image>
      )}
      {!href && path && (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} className="inline-block">
          <path fill="currentColor" d={path} />
        </svg>
      )}
      {children}
    </span>
  )
}
