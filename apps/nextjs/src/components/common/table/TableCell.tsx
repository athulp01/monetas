import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};
export const TableCell = ({ children }: Props) => {
  return <td className="px-1 py-4">{children}</td>;
};
