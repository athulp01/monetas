import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
};
export const TableHeaderBlock = ({ children }: Props) => {
  return (
    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
      {children}
    </thead>
  );
};
