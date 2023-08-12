import { type ReactNode } from "react";

import TableLoading from "~/components/common/loading/TableLoading";
import { Pagination } from "~/components/common/table/Pagination";

type Props = {
  children: ReactNode;
  isLoading?: boolean;
  isPaginated?: boolean;
  totalItems?: number;
  currentPage?: number;
  setCurrentPage?: (page: number) => void;
  itemsInCurrentPage?: number;
};
export const Table = (props: Props) => {
  if (props.isLoading) {
    return <TableLoading />;
  }
  return (
    <div className="relative overflow-x-auto p-2 sm:rounded-lg">
      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 md:table">
        {props.children}
      </table>
      {props.isPaginated && (
        <Pagination
          currentPage={props.currentPage}
          totalCount={props.totalItems}
          currentCount={props.itemsInCurrentPage}
          setCurrentPage={props.setCurrentPage}
        />
      )}
    </div>
  );
};
