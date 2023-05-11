import React from "react";
import { Text, View } from "react-native";
import ActionButton from "react-native-action-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setStatusBarStyle } from "expo-status-bar";
import { FlashList } from "@shopify/flash-list";

import { api } from "~/utils/api";
import { type TransactionStackScreenProps } from "~/utils/types";
import TransactionItem, {
  type Transaction,
} from "~/components/TransactionItem";

export const TransactionsScreen = ({
  navigation,
}: TransactionStackScreenProps<"Transactions">) => {
  const date = new Date("2023-04-01T00:00:00.000Z");
  const transactionQuery = api.transaction.listTransactions.useQuery({
    month: date,
    page: 0,
    perPage: 10,
  });
  setStatusBarStyle("dark");
  const insets = useSafeAreaInsets();

  const handleTransactionPress = (transaction: Transaction) => {
    navigation.push("TransactionDetails", { transaction });
  };

  return (
    <View
      style={{
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View className={"mb-2 mt-2 flex flex-row justify-start"}>
        <View
          className={
            "mr-2 rounded-2xl border border-gray-200 bg-gray-100 p-1.5"
          }
        >
          <Text>📅 June, 2013</Text>
        </View>
      </View>
      <View className={"h-full w-full"}>
        <FlashList
          contentContainerStyle={{ backgroundColor: "white" }}
          data={transactionQuery.data?.transactions ?? []}
          estimatedItemSize={20}
          ItemSeparatorComponent={() => <View className="h-0" />}
          renderItem={(p) => (
            <TransactionItem
              handleItemClicked={handleTransactionPress}
              transaction={p.item}
            />
          )}
        ></FlashList>
      </View>
      <ActionButton buttonColor="black" offsetY={70}></ActionButton>
    </View>
  );
};
