import React from "react";
import { Text, View } from "react-native";

import { type RouterOutputs } from "@monetas/api";

export type Payee = RouterOutputs["payee"]["listPayees"]["payees"][0];

type Props = {
  payee: Payee;
};

const PayeeItem = (props: Props) => {
  return (
    <View className="mb-0 rounded-sm border-b border-gray-200 bg-white p-2 shadow-sm">
      <View className="flex flex-row justify-between">
        <View className="mb-0 flex flex-row items-center justify-start">
          <View className="mr-6 space-y-1 text-left">
            <Text className="text-md font-black text-gray-500">
              {props.payee?.name}
            </Text>
            <Text className="text-sm  text-gray-500">
              {props?.payee.categories
                .map((category) => category.name)
                .join(", ")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PayeeItem;
