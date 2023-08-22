import React from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import colors from "tailwindcss/colors";

import { type RootDrawerScreenProps } from "~/utils/types";
import { AccountDetailsScreen } from "~/screens/AccountsScreens/AccountDetailsScreen";
import { AccountsScreen } from "~/screens/drawerScreens/AccountsScreen";

const Stack = createNativeStackNavigator();

export const AccountsStack = ({
  navigation,
}: RootDrawerScreenProps<"Accounts">) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Accounts"
        component={AccountsScreen}
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
        name="AccountDetails"
        options={{
          headerShown: true,
          headerBackVisible: true,
          headerTitleStyle: { color: "white" },
          headerTintColor: "white",
          headerStyle: { backgroundColor: colors.red["400"] },
        }}
        component={AccountDetailsScreen}
      ></Stack.Screen>
    </Stack.Navigator>
  );
};
