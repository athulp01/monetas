/* eslint-disable @next/next/no-img-element */
// Why disabled:
// avatars.dicebear.com provides svg avatars
// next/image needs dangerouslyAllowSVG option for that

import React, { type ReactNode } from 'react'

type Props = {
  username: string
  avatar?: string | null
  api?: string
  className?: string
  children?: ReactNode
}

export default function UserAvatar({ username, avatar = null, className = '', children }: Props) {
  console.log('USER-> ', username, avatar)
  const avatarImage = avatar ?? 'https://api.dicebear.com/5.x/avataaars/svg'

  return (
    <div className={className}>
      <img
        src={avatarImage}
        alt={username}
        referrerPolicy="no-referrer"
        className="block h-auto w-full max-w-full rounded-full bg-gray-100 dark:bg-slate-800"
      />
      {children}
    </div>
  )
}
