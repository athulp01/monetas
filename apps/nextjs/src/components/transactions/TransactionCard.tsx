import React from "react";
import { mdiDelete, mdiPencil } from "@mdi/js";

import BaseIcon from "~/components/common/icon/BaseIcon";
import { DateFormater } from "../../lib/utils";
import CardBox from "../common/cards/CardBox";
import { type TransactionsList } from "./TransactionsTableView";

type Props = {
  transaction: TransactionsList[0];
  index: number;
  handleEdit: (i: number) => void;
};

const TransactionCard = (props: Props) => {
  return (
    <CardBox
      hasTable
      className="mb-1 ml-2 mr-2 border-2 border-gray-100 p-2 shadow-md last:mb-0"
    >
      <div className="flex flex-row justify-between">
        <div className="mb-0 flex flex-row items-center justify-start">
          <div className="mr-6 space-y-1 text-left">
            <p className="text-sm font-medium text-gray-500">
              {props.transaction.sourceAccount?.name}
            </p>
            <p className="text-sm text-gray-500">
              {props.transaction.payee?.name}
            </p>
            <p className="text-sm text-gray-500">
              {props.transaction.category?.name}
            </p>
          </div>
        </div>
        <div className="space-y-2 text-right">
          <h4
            className={
              props?.transaction?.type === "DEBIT"
                ? "text-md font-semibold text-red-600"
                : "text-md font-semibold text-green-500"
            }
          >
            {`${props?.transaction?.type === "DEBIT" ? "-" : "+"} ₹${
              props.transaction.amount
            }`}
          </h4>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {DateFormater.format(new Date(props.transaction?.timeCreated))}
          </p>

          <div>
            <button
              type="button"
              className="text-md mr-2 rounded-lg bg-white px-1 py-1 font-medium text-red-600 hover:bg-red-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            >
              <BaseIcon path={mdiDelete} size={20}></BaseIcon>
            </button>
            <button
              onClick={() => props.handleEdit(props.index)}
              type="button"
              className="text-md rounded-lg bg-white px-1 py-1 font-medium text-blue-500 hover:bg-red-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            >
              <BaseIcon path={mdiPencil} size={20}></BaseIcon>
            </button>
          </div>
        </div>
      </div>
    </CardBox>
  );
};

export default TransactionCard;
