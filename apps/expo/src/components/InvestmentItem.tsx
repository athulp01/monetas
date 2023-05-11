import React from "react";
import { Text, View } from "react-native";

import { type RouterOutputs } from "@monetas/api";

export type Investment =
  RouterOutputs["investment"]["listInvestments"]["investments"][0];

type Props = {
  investment: Investment;
};

const InvestmentItem = ({ investment }: Props) => {
  const diff = investment?.currentPrice - investment?.buyPrice;
  return (
    <View className="mb-0 rounded-sm border-b border-gray-200 bg-white p-2 shadow-sm">
      <View className="flex flex-row justify-between">
        <View className="mb-0 flex flex-row items-center justify-start">
          <View className="mr-6 space-y-1 text-left">
            <Text className="text-xs text-gray-500">{`Qty. ${investment.units} · Avg. ${investment.buyPrice}`}</Text>
            <Text className="text-md font-black text-gray-500">
              {investment.name}
            </Text>
            <Text className="text-xs text-gray-500">
              {`Invested ₹${investment.buyPrice * investment.units}`}
            </Text>
          </View>
        </View>
        <View className="space-y-2 text-right">
          <Text
            className={
              diff < 0
                ? "text-right text-xs font-semibold text-red-600"
                : diff > 0
                ? "text-right text-xs font-semibold text-green-500"
                : "text-right text-xs font-semibold text-blue-500"
            }
          >
            {`${diff < 0 ? "" : "+"}${Math.floor(
              (diff * 100) / investment?.buyPrice,
            )}%`}
          </Text>
          <Text
            className={
              diff < 0
                ? "text-right font-semibold text-red-600"
                : diff > 0
                ? "text-right font-semibold text-green-500"
                : "text-right font-semibold text-blue-500"
            }
          >
            {diff < 0 ? "" : "+"}
            {" ₹"}
            {`${diff * investment?.units} `}
          </Text>
          <Text className="text-right text-xs text-gray-500 dark:text-slate-400">
            {`LTP ₹${investment.currentPrice}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default InvestmentItem;
