import React from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { type RootDrawerScreenProps } from "~/utils/types";
import { TransactionDetailsScreen } from "~/screens/TransactionsScreens/TransactionDetailsScreen";
import { HomeScreen } from "~/screens/drawerScreens/HomeScreen";
import { TransactionsScreen } from "~/screens/drawerScreens/TransactionsScreen";

const Stack = createNativeStackNavigator();

export const HomeStack = ({ navigation }: RootDrawerScreenProps<"Home">) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
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
        name="TransactionDetailsHome"
        options={{
          headerShown: true,
          headerBackVisible: true,
          headerTitleStyle: { color: "white" },
          headerTintColor: "white",
        }}
        component={TransactionDetailsScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="TransactionListHome"
        options={{
          headerShown: true,
          headerBackVisible: true,
          headerTitle: "Transactions",
        }}
        component={TransactionsScreen}
      ></Stack.Screen>
    </Stack.Navigator>
  );
};
