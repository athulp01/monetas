import React from "react";
import ReactPaginate from "react-paginate";

import { ITEMS_PER_PAGE } from "~/config/site";

interface Props {
  currentPage: number;
  totalCount: number;
  currentCount: number;
  setCurrentPage: (page: number) => void;
}
export const Pagination = ({
  currentCount,
  currentPage,
  setCurrentPage,
  totalCount,
}: Props) => {
  const numPages = Math.floor(totalCount / ITEMS_PER_PAGE) + 1;
  if (numPages <= 1) {
    return <></>;
  }
  return (
    <nav
      className="flex items-end justify-between p-4"
      aria-label="Table navigation"
    >
      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {currentPage * ITEMS_PER_PAGE + 1}-
          {currentPage * ITEMS_PER_PAGE + currentCount || 0}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {totalCount}
        </span>
      </span>
      <ReactPaginate
        breakLabel="..."
        nextLabel={
          <svg
            className="w-5"
            style={{ height: "1.14rem" }}
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
        }
        onPageChange={(event) => {
          setCurrentPage(event.selected);
        }}
        pageRangeDisplayed={4}
        forcePage={currentPage}
        pageCount={numPages}
        previousLabel={
          <svg
            className="h-5 w-5"
            style={{ height: "1.14rem" }}
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
        }
        containerClassName={
          "inline-flex items-center -space-x-px text-gray-500  bg-white border-gray-300"
        }
        pageLinkClassName={
          "px-3 py-2 leading-tight border hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        }
        breakLinkClassName={
          "px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        }
        previousLinkClassName={
          "block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        }
        nextLinkClassName={
          "block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        }
        activeLinkClassName={
          "z-10 px-3 py-2 leading-tight text-blue-600 border bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
        }
        renderOnZeroPageCount={null}
      />
    </nav>
  );
};
