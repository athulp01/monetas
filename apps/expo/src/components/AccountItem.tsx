import React from "react";
import { Image, Text, View } from "react-native";

import { type RouterOutputs } from "@monetas/api";

export type Account = RouterOutputs["account"]["listAccounts"]["accounts"][0];

type Props = {
  account: Account;
};

const AccountItem = (props: Props) => {
  return (
    <View className="mb-0 rounded-sm border-b border-gray-200 bg-white p-2 shadow-sm">
      <View className="flex flex-row justify-between">
        <View className="mb-0 flex flex-row items-center justify-start">
          <Image
            className="mr-2 h-10 w-10 rounded-full"
            source={{ uri: props?.account?.accountProvider?.icon }}
            alt="Rounded avatar"
          />
          <View className="mr-6 space-y-1 text-left">
            <Text className="text-md font-black text-gray-500">
              {props.account?.name}
            </Text>
            <Text className="text-sm  text-gray-500">
              {props.account?.accountNumber}
            </Text>
          </View>
        </View>
        <View className="space-y-2 text-right">
          <Text
            className={
              props?.account?.balance < 0
                ? "text-md text-right font-semibold text-red-600"
                : props?.account?.balance > 0
                ? "text-md text-right font-semibold text-green-500"
                : "text-md text-right font-semibold text-blue-500"
            }
          >
            ₹{props.account.balance}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-slate-400">
            {props.account.accountType?.name}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AccountItem;
