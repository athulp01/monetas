import React, { useEffect, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setStatusBarStyle } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import colors from "tailwindcss/colors";

import { api } from "~/utils/api";
import { type AccountStackScreenProps } from "~/utils/types";
import { type Account } from "~/components/AccountItem";

export const AccountDetailsScreen = ({
  route,
}: AccountStackScreenProps<"AccountDetails">) => {
  const form = useForm<Account>({
    defaultValues: route.params.account,
  });
  const navigation = useNavigation();

  const balance = form.watch("balance", 0);

  const [isProviderDropDownOpen, setIsProviderDropDownOpen] = useState(false);
  const [isTypeDropDownOpen, setIsTypeDropDownOpen] = useState(false);

  const insets = useSafeAreaInsets();

  const providersQuery = api.account.listAccountProviders.useQuery();
  const typesQuery = api.account.listAccountTypes.useQuery();

  useEffect(() => {
    if (balance < 0) {
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
  }, [navigation, balance]);

  useEffect(() => {
    setStatusBarStyle("light");
    return () => {
      setStatusBarStyle("dark");
    };
  });

  return (
    <View
      className={`max-h-screen ${
        balance < 0 ? "bg-red-400" : "bg-green-400"
      } flex-1`}
    >
      <View className={"flex h-1/4 justify-end pt-12"}>
        <View>
          <Text className={"text-md pl-2 pr-0 pt-5 text-white"}>Balance</Text>
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
              name="balance"
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
          <Text className={"mb-1.5 font-light"}>Account Provider</Text>
          <Controller
            control={form.control}
            name="accountProvider.id"
            render={({ field }) => (
              <DropDownPicker
                zIndex={6000}
                zIndexInverse={1000}
                placeholder={"Select an account provider"}
                open={isProviderDropDownOpen}
                value={field.value}
                items={
                  providersQuery?.data?.map((provider) => ({
                    label: provider.name,
                    value: provider.id,
                  })) ?? []
                }
                setOpen={setIsProviderDropDownOpen}
                setValue={(value) => {
                  field.onChange(value(field.value));
                }}
              />
            )}
          />
          <Text className={"mb-1.5 mt-3 font-light"}>Account Type</Text>
          <Controller
            control={form.control}
            name="accountType.id"
            render={({ field }) => (
              <DropDownPicker
                bottomOffset={20}
                zIndex={5000}
                zIndexInverse={2000}
                placeholder={"Select account"}
                loading={typesQuery.isLoading}
                open={isTypeDropDownOpen}
                items={
                  typesQuery.data?.map((account) => ({
                    label: account.name,
                    value: account.id,
                  })) ?? []
                }
                value={field.value}
                setOpen={setIsTypeDropDownOpen}
                setValue={(value) => {
                  field.onChange(value(field.value));
                }}
              />
            )}
          ></Controller>
          <Text className={"mb-1.5 mt-3 font-light"}>Account Number</Text>
          <Controller
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <TextInput
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value}
                onChangeText={(text) => field.onChange(text)}
                className={"w-full rounded-md border p-3.5"}
                placeholder={"Last 4 digits"}
              ></TextInput>
            )}
          ></Controller>
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
