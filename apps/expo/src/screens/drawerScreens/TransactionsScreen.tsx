import React, { useState } from "react";
import { Text, View } from "react-native";
import ActionButton from "react-native-action-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setStatusBarStyle } from "expo-status-bar";
import { FlashList } from "@shopify/flash-list";

import { api } from "~/utils/api";
import { type TransactionStackScreenProps } from "~/utils/types";
import { ConfirmationSheet } from "~/components/ConfirmationSheet";
import GmailStyleSwipeableRow from "~/components/SwipeableRow";
import TransactionItem, {
  type Transaction,
} from "~/components/TransactionItem";

export const TransactionsScreen = ({
  navigation,
}: TransactionStackScreenProps<"Transactions">) => {
  const [isDeleteConfirmSheetVisible, setIsDeleteConfirmSheetVisible] =
    useState(false);
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

  const handleCreateTransactionPress = () => {
    const transaction: Partial<Transaction> = {
      type: "DEBIT",
      timeCreated: new Date(),
    };
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
            <GmailStyleSwipeableRow
              handleDelete={() => {
                setIsDeleteConfirmSheetVisible(true);
                return Promise.resolve();
              }}
            >
              <TransactionItem
                handleItemClicked={handleTransactionPress}
                transaction={p.item}
              />
            </GmailStyleSwipeableRow>
          )}
        ></FlashList>
      </View>
      <ConfirmationSheet
        isOpen={isDeleteConfirmSheetVisible}
        onClose={() => setIsDeleteConfirmSheetVisible(false)}
        title={"Delete Transaction"}
        message={"Are you sure you want to delete this transaction?"}
        onConfirm={() => {}}
      ></ConfirmationSheet>
      <ActionButton
        buttonColor="black"
        offsetY={70}
        onPress={handleCreateTransactionPress}
      ></ActionButton>
    </View>
  );
};
