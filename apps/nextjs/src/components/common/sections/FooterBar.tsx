import React, { type ReactNode } from 'react'
import { containerMaxW } from '../../../config/config'

type Props = {
  children?: ReactNode
}

export default function FooterBar({ children }: Props) {
  return (
    <footer className={`px-6 py-2 ${containerMaxW}`}>
      <div className="block items-center justify-between md:flex">
        <div className="mb-6 text-center md:mb-0 md:text-left">{children}</div>
      </div>
    </footer>
  )
}
