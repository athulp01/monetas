import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import moment from "moment";

import { api } from "~/utils/api";
import { type HomeStackScreenProps } from "~/utils/types";
import TransactionItem, {
  type Transaction,
} from "~/components/TransactionItem";

const chartConfig = {
  backgroundGradientFrom: "#1E2923",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#08130D",
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  useShadowColorFromDataset: false, // optional
};
const screenWidth = Dimensions.get("window").width;
const data = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43, 23],
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // optional
      strokeWidth: 0, // optional
    },
  ],
};

export const HomeScreen = ({ navigation }: HomeStackScreenProps<"Home">) => {
  const incomeQuery = api.reports.getTotalIncomeForMonth.useQuery({
    month: moment().startOf("day").toDate(),
  });
  const expenseQuery = api.reports.getTotalExpensesForMonth.useQuery({
    month: moment().startOf("day").toDate(),
  });
  const netWorthQuery = api.reports.getNetWorth.useQuery();
  const date = new Date("2023-04-01T00:00:00.000Z");
  const transactionQuery = api.transaction.listTransactions.useQuery({
    month: date,
    page: 0,
    perPage: 5,
  });

  const handleTransactionPress = (transaction: Transaction) => {
    navigation.push("TransactionDetailsHome", { transaction });
  };

  return (
    <View className={"flex"}>
      <View className={"flex"}>
        <View className={"items-center"}>
          <Text className={"mt-3 text-sm text-gray-500"}>Net Worth</Text>
          <Text className={"mt-3 text-4xl font-medium"}>
            ₹{netWorthQuery?.data?.netWorth}
          </Text>
        </View>
        <View className={"mt-6 flex flex-row flex-nowrap justify-between p-2"}>
          <View
            className={
              "flex w-44 flex-row rounded-2xl bg-green-400 p-2 text-white"
            }
          >
            <View
              className={
                "flex items-center justify-center rounded-2xl bg-white p-2 pr-3"
              }
            >
              <MaterialCommunityIcons
                name="bank-transfer-in"
                size={32}
                color="black"
              />
            </View>
            <View className={"ml-4"}>
              <Text className={"text-center text-white"}>Income</Text>
              <Text className={"text-2xl font-medium text-white"}>
                ₹{incomeQuery?.data?.totalIncome}
              </Text>
            </View>
          </View>
          <View
            className={
              "flex w-44 flex-row rounded-2xl bg-red-400 p-2 text-white"
            }
          >
            <View
              className={
                "flex items-center justify-center rounded-2xl bg-white p-2 pr-3"
              }
            >
              <MaterialCommunityIcons
                name="bank-transfer-out"
                size={32}
                color="black"
              />
            </View>
            <View className={"ml-4"}>
              <Text className={"text-center text-white"}>Expense</Text>
              <Text className={"text-2xl font-medium text-white"}>
                ₹{expenseQuery?.data?.totalExpenses}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className={"mt-6 "}>
        <LineChart
          data={data}
          width={screenWidth}
          height={256}
          chartConfig={chartConfig}
          withInnerLines={false}
          withDots={false}
          bezier
        />
      </View>
      <View className={"mt-6 p-2"}>
        <View className={"flex"}>
          <View className={"flex flex-row flex-nowrap justify-between"}>
            <Text className={"text-lg font-medium text-black"}>
              Recent Transactions
            </Text>
            <TouchableOpacity
              onPress={() => navigation.push("TransactionListHome")}
              className={"rounded-2xl bg-gray-300 p-2"}
            >
              <Text>See All</Text>
            </TouchableOpacity>
          </View>
          <View className={"mt-2 h-full w-full"}>
            <FlashList
              contentContainerStyle={{ backgroundColor: "white" }}
              data={transactionQuery.data?.transactions ?? []}
              estimatedItemSize={5}
              scrollEnabled
              ItemSeparatorComponent={() => <View className="h-0" />}
              renderItem={(p) => (
                <TransactionItem
                  handleItemClicked={handleTransactionPress}
                  transaction={p.item}
                />
              )}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
