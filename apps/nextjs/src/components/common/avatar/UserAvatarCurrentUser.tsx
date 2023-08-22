import React, { type ReactNode } from 'react'
import UserAvatar from './UserAvatar'

type Props = {
  className?: string
  children?: ReactNode
}

export default function UserAvatarCurrentUser({ className = '', children }: Props) {

  return (
    <UserAvatar
      username={"Athul"}
      avatar={"Test"}
      className={className}
    >
      {children}
    </UserAvatar>
  )
}
