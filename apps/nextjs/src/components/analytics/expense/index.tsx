import React from "react";
import type moment from "moment";

import { ExpenseBar } from "./ExpenseBar";
import { ExpenseCategoryPie } from "./ExpenseCategoryPie";
import { ExpensePayeePie } from "./ExpensePayeePie";

interface Props {
  rangeStart: moment.Moment;
  rangeEnd: moment.Moment;
}
export const ExpenseAnalytics = ({ rangeStart, rangeEnd }: Props) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-y-16  md:grid-cols-1">
        <div className="h-72">
          <ExpenseBar rangeEnd={rangeEnd} rangeStart={rangeStart}></ExpenseBar>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="h-96">
            <p className="text-center text-lg text-gray-900 dark:text-white">
              Categories
            </p>
            <ExpenseCategoryPie rangeEnd={rangeEnd} rangeStart={rangeStart} />
          </div>
          <div className="h-96">
            <ExpensePayeePie rangeEnd={rangeEnd} rangeStart={rangeStart} />
          </div>
        </div>
      </div>
    </>
  );
};
