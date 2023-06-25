import React, { type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function SectionMain({ children }: Props) {
  return (
    <section className={`min-h-screen bg-gray-50 p-2 pt-6`}>{children}</section>
  );
}
