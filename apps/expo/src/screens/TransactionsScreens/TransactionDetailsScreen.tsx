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

import { type RouterOutputs } from "@monetas/api";

interface Props {
  transaction: RouterOutputs["transaction"]["listTransactions"]["transactions"][0];
}

export const TransactionDetailsScreen = ({}: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
  ]);
  const [date, setDate] = useState(new Date(1598051730000));
  const [show, setShow] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [transactionType, setTransactionType] = useState<
    "expense" | "income" | "transfer"
  >("expense");
  const insets = useSafeAreaInsets();

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    hideDatePicker();
  };

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      title: transactionType === "expense" ? "Expense" : "Income",
    });
  }, [transactionType]);

  useEffect(() => {
    setStatusBarStyle("light");
    return () => {
      setStatusBarStyle("dark");
    };
  });

  return (
    <View
      className={`max-h-screen ${
        transactionType === "expense" ? "bg-red-400" : "bg-green-400"
      } flex-1`}
    >
      <View className={"flex h-2/6 justify-between pt-12"}>
        <View className="mb-10 flex-row items-center justify-center rounded-md shadow-sm">
          <TouchableOpacity
            onPress={() => setTransactionType("expense")}
            className={`px-2 py-1 text-sm font-medium text-black  ${
              transactionType === "expense" ? "bg-red-500" : "bg-transparent"
            } rounded-l-lg border hover:bg-gray-100 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500`}
          >
            <Text>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTransactionType("income")}
            className={`px-2 py-1 text-sm font-medium text-gray-900 ${
              transactionType === "income" ? "bg-green-500" : "bg-transparent"
            } border-b border-t hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500`}
          >
            <Text>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity className="rounded-r-md border bg-transparent px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500">
            <Text>Transfer</Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text className={"text-md pl-2 pr-0 pt-5 text-white"}>Amount</Text>
          <View className={"flex flex-row justify-start"}>
            <View
              className={`p-2 text-center ${
                Platform.OS == "android" ? "justify-end" : "justify-center"
              } flex`}
            >
              <Text className={"text-center text-5xl text-white"}>₹</Text>
            </View>
            <TextInput
              className={"h-20 w-full text-5xl text-white"}
              placeholder={"0.00"}
              keyboardType="numeric"
            ></TextInput>
          </View>
        </View>
      </View>
      <View
        className={
          "flex h-4/6 justify-between rounded-3xl rounded-b-none bg-white p-6"
        }
      >
        <View>
          <DropDownPicker
            placeholder={"Select an account"}
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
          />
          <DropDownPicker
            style={{ marginTop: 20 }}
            placeholder={"Select category"}
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
          />
          <DropDownPicker
            style={{ marginTop: 20 }}
            placeholder={"Select payee"}
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
          />
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />

          <View style={{ marginTop: 20 }} className={"rounded-md border p-3.5"}>
            <Text onPress={() => showDatePicker()}>
              {"📆  " + date.toLocaleDateString()}
            </Text>
          </View>
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
