import React, { useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ActionButton from "react-native-action-button";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Switch } from "react-native-switch";
import { setStatusBarStyle } from "expo-status-bar";
import { Picker } from "@react-native-picker/picker";
import { FlashList } from "@shopify/flash-list";
import colors from "tailwindcss/colors";

import { api } from "~/utils/api";
import { type TransactionStackScreenProps } from "~/utils/types";
import { ConfirmationSheet } from "~/components/ConfirmationSheet";
import GmailStyleSwipeableRow from "~/components/SwipeableRow";
import TransactionItem, {
  type Transaction,
} from "~/components/TransactionItem";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    MONTHS[new Date().getMonth()],
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showUnverified, setShowUnverified] = useState(false);
  const [selectedSort, setSelectedSort] = useState<"Date" | "Amount">("Date");

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
      <View
        className={
          "mb-2 ml-2 mr-2 mt-2 flex-row justify-between rounded-2xl bg-black p-2 text-white"
        }
        style={{ minHeight: 30 }}
      >
        <TouchableOpacity
          onPress={() => actionSheetRef.current?.show()}
          className={"bg-gray-10 mr-2 flex-row items-center p-1.5"}
        >
          <Text className={"text-white"}>
            Period:{" "}
            <Text className={"font-bold text-blue-400"}>
              {selectedMonth}, {selectedYear}
            </Text>
          </Text>
        </TouchableOpacity>
        <View
          className={
            "bg-gray-10 flex-row items-center justify-center  p-1.5 align-middle"
          }
        >
          <Text
            className={
              "mr-2 justify-self-center text-center text-sm text-white"
            }
          >
            Show Unverified:
          </Text>
          <Switch
            value={showUnverified}
            onValueChange={(val) => setShowUnverified(val)}
            activeText={""}
            inActiveText={""}
            circleSize={25}
            backgroundActive={colors.blue[400]}
          ></Switch>
        </View>
      </View>
      <View className={"h-full w-full p-2"}>
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
        offsetY={90}
        onPress={handleCreateTransactionPress}
      ></ActionButton>
      <ActionSheet
        ref={actionSheetRef}
        headerAlwaysVisible
        closeOnTouchBackdrop
      >
        <Text className={"text-center text-lg font-bold"}>
          {"Choose Period"}
        </Text>
        <View className={"flex-row"}>
          <View className={"w-1/2"}>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            >
              {MONTHS.map((month) => (
                <Picker.Item label={month} value={month} key={month} />
              ))}
            </Picker>
          </View>
          <View className={"w-1/2"}>
            <Picker
              selectedValue={selectedYear}
              onValueChange={(itemValue) => setSelectedYear(itemValue)}
            >
              {Array.from({ length: 100 }).map((_, i) => (
                <Picker.Item label={`${2000 + i}`} value={2000 + i} key={i} />
              ))}
            </Picker>
          </View>
        </View>
      </ActionSheet>
    </View>
  );
};
