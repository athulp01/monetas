import React, { useEffect, useMemo, useState } from "react";
import { Platform, Text, TextInput, View } from "react-native";
import ActionButton from "react-native-action-button";
import { setStatusBarStyle } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import colors from "tailwindcss/colors";

import { api } from "~/utils/api";
import { type TransactionStackScreenProps } from "~/utils/types";
import { ConfirmationSheet } from "~/components/ConfirmationSheet";
import { DateTime } from "~/components/DateTime";
import { DropDown } from "~/components/DropDown";
import { type Transaction } from "~/components/TransactionItem";

export const TransactionDetailsScreen = ({
  route,
}: TransactionStackScreenProps<"TransactionDetails">) => {
  const form = useForm<Transaction>({
    defaultValues: route.params.transaction,
  });
  const navigation = useNavigation();
  const transactionType = form.watch("type");
  console.log(transactionType);

  const isCreateMode = route.params.transaction.id === undefined;
  const [editMode, setEditMode] = useState(isCreateMode);

  const accountQuery = api.account.listAccounts.useQuery();
  const categoriesQuery = api.category.listCategories.useQuery({
    type: transactionType,
  });
  const payeesQuery = api.payee.listPayees.useQuery({
    categoryId: form.watch("category.id"),
  });

  const [isUpdateConfirmSheetVisible, setIsUpdateConfirmSheetVisible] =
    useState(false);
  const [isDeleteConfirmSheetVisible, setIsDeleteConfirmSheetVisible] =
    useState(false);

  const transactionTypes = useMemo(
    () => [
      { label: "Income", value: "CREDIT" },
      { label: "Expense", value: "DEBIT" },
      { label: "Transfer", value: "TRANSFER" },
    ],
    [],
  );

  useEffect(() => {
    console.log("TEST", transactionTypes);
  }, [transactionType]);

  useEffect(() => {
    if (transactionType === "TRANSFER") {
      navigation.setOptions({
        title: "Transfer",
        headerStyle: { backgroundColor: colors.blue["400"] },
        headerRight: isCreateMode
          ? undefined
          : () => (
              <MaterialCommunityIcons
                key={"delete"}
                onPress={() => setIsDeleteConfirmSheetVisible(true)}
                name={"delete-forever"}
                size={24}
                color={"white"}
              />
            ),
      });
    } else if (transactionType === "DEBIT") {
      navigation.setOptions({
        title: "Expense",
        headerStyle: { backgroundColor: colors.red["400"] },
        headerRight: isCreateMode
          ? undefined
          : () => (
              <MaterialCommunityIcons
                key={"delete"}
                onPress={() => setIsDeleteConfirmSheetVisible(true)}
                name={"delete-forever"}
                size={24}
                color={"white"}
              />
            ),
      });
    } else {
      navigation.setOptions({
        title: "Income",
        headerStyle: { backgroundColor: colors.green["400"] },
        headerRight: isCreateMode
          ? undefined
          : () => (
              <MaterialCommunityIcons
                key={"delete"}
                onPress={() => setIsDeleteConfirmSheetVisible(true)}
                name={"delete-forever"}
                size={24}
                color={"white"}
              />
            ),
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
              <DropDown
                readonly={!editMode}
                zIndex={6000}
                zIndexInverse={1000}
                disabled={!editMode}
                placeholder={"Select transaction type"}
                loading={false}
                value={field.value}
                items={transactionTypes}
                setValue={field.onChange}
              />
            )}
          />
          <Text className={"mb-1.5 mt-3 font-light"}>Account</Text>
          <Controller
            control={form.control}
            name="sourceAccount.id"
            render={({ field }) => (
              <DropDown
                readonly={!editMode}
                zIndex={5000}
                zIndexInverse={2000}
                placeholder={"Select account"}
                loading={accountQuery.isLoading}
                items={
                  accountQuery.data?.accounts.map((account) => ({
                    label: account.name,
                    value: account.id,
                  })) ?? []
                }
                value={field.value}
                setValue={field.onChange}
              />
            )}
          ></Controller>
          <Text className={"mb-1.5 mt-3 font-light"}>Category</Text>
          <Controller
            control={form.control}
            name="category.id"
            render={({ field }) => (
              <DropDown
                readonly={!editMode}
                zIndex={4000}
                zIndexInverse={2000}
                placeholder={"Select category"}
                loading={categoriesQuery.isLoading}
                items={
                  categoriesQuery.data?.categories.map((account) => ({
                    label: account.name,
                    value: account.id,
                  })) ?? []
                }
                value={field.value}
                setValue={field.onChange}
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
                <DropDown
                  disabled={form.watch("category.id") == null}
                  readonly={!editMode}
                  zIndex={2000}
                  zIndexInverse={2000}
                  placeholder={"Select destination account"}
                  loading={accountQuery.isLoading}
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
                  setValue={field.onChange}
                />
              )}
            ></Controller>
          ) : (
            <Controller
              control={form.control}
              name="payee.id"
              render={({ field }) => (
                <DropDown
                  disabled={form.watch("category.id") == null}
                  readonly={!editMode}
                  zIndex={2000}
                  zIndexInverse={2000}
                  placeholder={"Select payee"}
                  loading={payeesQuery.isLoading}
                  items={
                    payeesQuery.data?.payees.map((account) => ({
                      label: account.name,
                      value: account.id,
                    })) ?? []
                  }
                  value={field.value}
                  setValue={field.onChange}
                />
              )}
            ></Controller>
          )}
          <Text className={"mb-1.5 mt-3 font-light"}>Date</Text>
          <Controller
            control={form.control}
            name="timeCreated"
            render={({ field }) => (
              <DateTime
                value={field.value}
                disabled={!editMode}
                onChange={field.onChange}
              ></DateTime>
            )}
          ></Controller>
        </View>
      </View>
      {!editMode && (
        <ActionButton
          buttonColor="black"
          onPress={() => setEditMode(true)}
          renderIcon={() => (
            <MaterialCommunityIcons name={"pencil"} size={20} color={"white"} />
          )}
        ></ActionButton>
      )}
      {editMode && (
        <ActionButton
          buttonColor="black"
          onPress={() => setIsUpdateConfirmSheetVisible(true)}
          renderIcon={() => (
            <MaterialCommunityIcons
              name={"content-save"}
              size={20}
              color={"white"}
            />
          )}
        ></ActionButton>
      )}
      <ConfirmationSheet
        isOpen={isUpdateConfirmSheetVisible}
        onClose={() => setIsUpdateConfirmSheetVisible(false)}
        title={"Update Transaction"}
        message={"Are you sure you want to update this transaction?"}
        onConfirm={() => {}}
      ></ConfirmationSheet>
      <ConfirmationSheet
        isOpen={isDeleteConfirmSheetVisible}
        onClose={() => setIsDeleteConfirmSheetVisible(false)}
        title={"Delete Transaction"}
        message={"Are you sure you want to delete this transaction?"}
        onConfirm={() => {}}
      ></ConfirmationSheet>
    </View>
  );
};
