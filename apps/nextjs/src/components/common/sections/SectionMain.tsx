import React, { type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function SectionMain({ children }: Props) {
  return (
    <section className={`min-h-full min-w-full bg-gray-50 p-2`}>
      {children}
    </section>
  );
}
