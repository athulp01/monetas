import React, { type ReactNode } from 'react'
import { gradientBgDark } from '../../../config/colors'
import { useAppSelector } from '../../../stores/hooks'

type Props = {
  children: ReactNode
}

export default function SectionFullScreen({ children }: Props) {
  const darkMode = useAppSelector((state) => state.style.darkMode)

  let componentClass = 'flex min-h-screen items-center justify-center '

  if (darkMode) {
    componentClass += gradientBgDark
  }

  return <div className={componentClass}>{children}</div>
}
