import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { type RouterOutputs } from "@monetas/api";

export type Transaction =
  RouterOutputs["transaction"]["listTransactions"]["transactions"][0];

type Props = {
  transaction: Transaction;
  handleItemClicked: (transaction: Transaction) => void;
};

const TransactionItem = (props: Props) => {
  return (
    <TouchableOpacity
      onPress={() => props.handleItemClicked(props.transaction)}
      className="mb-0  rounded-lg  border-b border-gray-200 bg-white p-2 shadow-sm"
    >
      <View className="flex flex-row justify-between">
        <View className="mb-0 flex flex-row items-center justify-start">
          <View className="mr-6 space-y-1 text-left">
            <Text className="text-md font-bold text-black">
              {props.transaction.category?.name}
            </Text>
            <Text className="text-sm  text-gray-500">
              {props.transaction.sourceAccount?.name} {"→"}{" "}
              {props.transaction.payee?.name ??
                props.transaction.transferredAccount?.name}
            </Text>
          </View>
        </View>
        <View className="space-y-2 text-right">
          <Text
            className={
              props?.transaction?.type === "DEBIT"
                ? "text-md text-right font-semibold text-red-600"
                : props?.transaction?.type === "CREDIT"
                ? "text-md text-right font-semibold text-green-500"
                : "text-md text-right font-semibold text-blue-500"
            }
          >
            {`${
              props?.transaction?.type === "DEBIT"
                ? "-"
                : props?.transaction?.type === "CREDIT"
                ? "+"
                : " "
            } ₹${props.transaction.amount}`}
          </Text>
          <Text className="text-right text-sm text-gray-500 dark:text-slate-400">
            {new Date(props.transaction?.timeCreated).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionItem;
