import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};
export const TableRow = ({ children }: Props) => {
  return (
    <tr className="border-b bg-white last:border-b-0 dark:border-gray-700 dark:bg-gray-800">
      {children}
    </tr>
  );
};
