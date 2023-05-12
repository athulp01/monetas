import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setStatusBarStyle } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import colors from "tailwindcss/colors";

import { api } from "~/utils/api";
import { type TransactionStackScreenProps } from "~/utils/types";
import { type Transaction } from "~/components/TransactionItem";

export const TransactionDetailsScreen = ({
  route,
}: TransactionStackScreenProps<"TransactionDetails">) => {
  const form = useForm<Transaction>({
    defaultValues: route.params.transaction,
  });
  const navigation = useNavigation();
  const transactionType = form.watch("type");
  const [transactionTypes, setTransactionTypes] = useState([
    { label: "Income", value: "CREDIT" },
    { label: "Expense", value: "DEBIT" },
    { label: "Transfer", value: "TRANSFER" },
  ]);

  const [isTransactionTypeDropDownOpen, setIsTransactionTypeDropDownOpen] =
    useState(false);
  const [isAccountDropDownOpen, setIsAccountDropDownOpen] = useState(false);
  const [isCategoryDropDownOpen, setIsCategoryDropDownOpen] = useState(false);
  const [isPayeeDropDownOpen, setIsPayeeDropDownOpen] = useState(false);
  const [
    isTransferredAccountDropDownOpen,
    setIsTransferredAccountDropDownOpen,
  ] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const insets = useSafeAreaInsets();

  const accountQuery = api.account.listAccounts.useQuery();
  const categoriesQuery = api.category.listCategories.useQuery({
    type: transactionType,
  });
  const payeesQuery = api.payee.listPayees.useQuery({
    categoryId: form.watch("category.id"),
  });

  useEffect(() => {
    if (transactionType === "TRANSFER") {
      navigation.setOptions({
        title: "Transfer",
        headerStyle: { backgroundColor: colors.blue["400"] },
      });
    } else if (transactionType === "DEBIT") {
      navigation.setOptions({
        title: "Expense",
        headerStyle: { backgroundColor: colors.red["400"] },
      });
    } else {
      navigation.setOptions({
        title: "Income",
        headerStyle: { backgroundColor: colors.green["400"] },
      });
    }
  }, [navigation, transactionType]);

  useEffect(() => {
    setStatusBarStyle("light");
    return () => {
      setStatusBarStyle("dark");
    };
  });

  return (
    <View
      className={`max-h-screen ${
        transactionType === "DEBIT"
          ? "bg-red-400"
          : transactionType === "CREDIT"
          ? "bg-green-400"
          : "bg-blue-400"
      } flex-1`}
    >
      <View className={"flex h-1/4 justify-end pt-12"}>
        <View>
          <Text className={"text-md pl-2 pr-0 pt-5 text-white"}>Amount</Text>
          <View className={"flex flex-row justify-start"}>
            <View
              className={`pl-1 text-center ${
                Platform.OS == "android" ? "justify-end" : "justify-center"
              }`}
            >
              <Text className={"text-center text-5xl text-white"}>₹</Text>
            </View>
            <Controller
              control={form.control}
              name="amount"
              render={({ field }) => (
                <TextInput
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value?.toString()}
                  onChangeText={(text) => field.onChange(parseInt(text))}
                  className={"h-20 w-full text-5xl text-white"}
                  placeholder={"0.00"}
                  keyboardType="numeric"
                ></TextInput>
              )}
            ></Controller>
          </View>
        </View>
      </View>
      <View
        className={
          "flex h-3/4 justify-between rounded-3xl rounded-b-none bg-white p-6"
        }
      >
        <View className={"pt-4"}>
          <Text className={"mb-1.5 font-light"}>Transaction type</Text>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <DropDownPicker
                zIndex={6000}
                zIndexInverse={1000}
                placeholder={"Select an account"}
                open={isTransactionTypeDropDownOpen}
                value={field.value}
                items={transactionTypes}
                setOpen={setIsTransactionTypeDropDownOpen}
                setValue={(value) => {
                  field.onChange(value(field.value));
                }}
              />
            )}
          />
          <Text className={"mb-1.5 mt-3 font-light"}>Account</Text>
          <Controller
            control={form.control}
            name="sourceAccount.id"
            render={({ field }) => (
              <DropDownPicker
                bottomOffset={20}
                zIndex={5000}
                zIndexInverse={2000}
                placeholder={"Select account"}
                loading={accountQuery.isLoading}
                open={isAccountDropDownOpen}
                items={
                  accountQuery.data?.accounts.map((account) => ({
                    label: account.name,
                    value: account.id,
                  })) ?? []
                }
                value={field.value}
                setOpen={setIsAccountDropDownOpen}
                setValue={(value) => {
                  field.onChange(value(field.value));
                }}
              />
            )}
          ></Controller>
          <Text className={"mb-1.5 mt-3 font-light"}>Category</Text>
          <Controller
            control={form.control}
            name="category.id"
            render={({ field }) => (
              <DropDownPicker
                bottomOffset={20}
                zIndex={4000}
                zIndexInverse={2000}
                placeholder={"Select category"}
                loading={categoriesQuery.isLoading}
                open={isCategoryDropDownOpen}
                items={
                  categoriesQuery.data?.categories.map((account) => ({
                    label: account.name,
                    value: account.id,
                  })) ?? []
                }
                value={field.value}
                setOpen={setIsCategoryDropDownOpen}
                setValue={(value) => {
                  field.onChange(value(field.value));
                }}
              />
            )}
          ></Controller>
          <Text className={"mb-1.5 mt-3 font-light"}>
            {transactionType === "TRANSFER" ? "Destination account" : "Payee"}
          </Text>
          {transactionType === "TRANSFER" ? (
            <Controller
              control={form.control}
              name="transferredAccount.id"
              render={({ field }) => (
                <DropDownPicker
                  bottomOffset={20}
                  disabled={form.watch("category.id") == null}
                  zIndex={2000}
                  zIndexInverse={2000}
                  placeholder={"Select destination account"}
                  loading={accountQuery.isLoading}
                  open={isTransferredAccountDropDownOpen}
                  items={
                    accountQuery.data?.accounts
                      .map((account) => ({
                        label: account.name,
                        value: account.id,
                      }))
                      .filter(
                        (account) =>
                          account?.value !== form.watch("sourceAccount.id"),
                      ) ?? []
                  }
                  value={field.value}
                  setOpen={setIsTransferredAccountDropDownOpen}
                  setValue={(value) => {
                    field.onChange(value(field.value));
                  }}
                />
              )}
            ></Controller>
          ) : (
            <Controller
              control={form.control}
              name="payee.id"
              render={({ field }) => (
                <DropDownPicker
                  bottomOffset={20}
                  disabled={form.watch("category.id") == null}
                  zIndex={2000}
                  zIndexInverse={2000}
                  placeholder={"Select payee"}
                  loading={payeesQuery.isLoading}
                  open={isPayeeDropDownOpen}
                  items={
                    payeesQuery.data?.payees.map((account) => ({
                      label: account.name,
                      value: account.id,
                    })) ?? []
                  }
                  value={field.value}
                  setOpen={setIsPayeeDropDownOpen}
                  setValue={(value) => {
                    field.onChange(value(field.value));
                  }}
                />
              )}
            ></Controller>
          )}
          <Controller
            control={form.control}
            name="timeCreated"
            render={({ field }) => (
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                style={{ marginTop: 20 }}
                date={field.value}
                mode="date"
                onConfirm={(date) => {
                  field.onChange(date);
                  setDatePickerVisibility(false);
                }}
                onCancel={() => setDatePickerVisibility(false)}
              />
            )}
          ></Controller>

          <Text className={"mb-1.5 mt-3 font-light"}>Date</Text>
          <TouchableOpacity
            onPress={() => setDatePickerVisibility(true)}
            className={"rounded-md border p-3.5"}
          >
            <Text>{`📆  ${form
              .watch("timeCreated")
              .toLocaleDateString()}`}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginBottom: insets.bottom }}>
          <Pressable className="rounded-2xl bg-black p-4 dark:bg-black">
            <Text className="text-center text-lg font-bold text-white dark:text-white">
              Save
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
