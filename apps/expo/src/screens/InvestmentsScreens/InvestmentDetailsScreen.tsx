import React, { useEffect } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setStatusBarStyle } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import colors from "tailwindcss/colors";

import { api } from "~/utils/api";
import { type InvestmentsStackScreenProps } from "~/utils/types";
import { type Investment } from "~/components/InvestmentItem";

export const InvestmentDetailsScreen = ({
  route,
}: InvestmentsStackScreenProps<"InvestmentDetails">) => {
  const form = useForm<Investment>({
    defaultValues: route.params.investment,
  });
  const navigation = useNavigation();

  const pAndL =
    (form.watch("currentPrice") - form.watch("buyPrice", 0)) *
    form.watch("units");

  api.investment.getQuote.useQuery(
    { symbol: form.watch("symbol"), type: "STOCK" },
    {
      enabled: form.watch("symbol") != null,
      onSuccess: (data) => {
        form.setValue("name", data.shortName);
        form.setValue("currentPrice", data.regularMarketPrice);
      },
    },
  );
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (pAndL < 0) {
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
  }, [navigation, pAndL]);

  useEffect(() => {
    setStatusBarStyle("light");
    return () => {
      setStatusBarStyle("dark");
    };
  });

  return (
    <View
      className={`max-h-screen ${
        pAndL < 0 ? "bg-red-400" : "bg-green-400"
      } flex-1`}
    >
      <View className={"flex h-1/4 justify-end pt-12"}>
        <View>
          <Text className={"text-md pl-2 pr-0 pt-5 text-white"}>P/L</Text>
          <View className={"flex flex-row justify-start"}>
            <View
              className={`pl-1 text-center ${
                Platform.OS == "android" ? "justify-end" : "justify-center"
              }`}
            >
              <Text className={"text-center text-5xl text-white"}>₹</Text>
            </View>
            <Text className={"h-20 w-full text-5xl text-white"}>{pAndL}</Text>
          </View>
        </View>
      </View>
      <View
        className={
          "flex h-3/4 justify-between rounded-3xl rounded-b-none bg-white p-6"
        }
      >
        <View className={"pt-4"}>
          <Text className={"mb-1.5 font-light"}>Symbol</Text>
          <Controller
            control={form.control}
            name="symbol"
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
          <Text className={"mb-1.5 mt-3 font-light"}>Buy Price</Text>
          <Controller
            control={form.control}
            name="buyPrice"
            render={({ field }) => (
              <TextInput
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value?.toString()}
                onChangeText={(text) => field.onChange(parseInt(text))}
                className={"rounded-md border p-3.5"}
                placeholder={"0.00"}
                keyboardType="numeric"
              ></TextInput>
            )}
          ></Controller>
          <Text className={"mb-1.5 mt-3 font-light"}>No. of units</Text>
          <Controller
            control={form.control}
            name="units"
            render={({ field }) => (
              <TextInput
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value.toString()}
                onChangeText={(text) => field.onChange(text)}
                className={"rounded-md border p-3.5"}
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
