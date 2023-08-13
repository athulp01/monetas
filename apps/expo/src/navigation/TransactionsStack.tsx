import React from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { type RootDrawerScreenProps } from "~/utils/types";
import { TransactionDetailsScreen } from "~/screens/TransactionsScreens/TransactionDetailsScreen";
import { TransactionsScreen } from "~/screens/drawerScreens/TransactionsScreen";

const Stack = createNativeStackNavigator();

export const TransactionsStack = ({
  navigation,
}: RootDrawerScreenProps<"Transactions">) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          headerLeft: () => (
            <MaterialCommunityIcons
              name="menu"
              onPress={navigation.toggleDrawer}
              size={24}
              style={{ marginRight: 10 }}
              color="#007AFE"
            />
          ),
          headerRight: () => (
            <View className={"flex-row justify-center"}>
              <MaterialCommunityIcons name={"filter-variant"} size={24} />
            </View>
          ),
          headerShown: true,
          contentStyle: { backgroundColor: "white" },
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="TransactionDetails"
        options={{
          headerShown: true,
          headerBackVisible: true,
          headerTitleStyle: { color: "white" },
          headerTintColor: "white",
        }}
        component={TransactionDetailsScreen}
      ></Stack.Screen>
    </Stack.Navigator>
  );
};
