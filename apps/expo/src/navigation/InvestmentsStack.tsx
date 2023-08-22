import React from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import colors from "tailwindcss/colors";

import { type RootDrawerScreenProps } from "~/utils/types";
import { InvestmentDetailsScreen } from "~/screens/InvestmentsScreens/InvestmentDetailsScreen";
import { InvestmentsScreen } from "~/screens/drawerScreens/InvestmentsScreen";

const Stack = createNativeStackNavigator();

export const InvestmentsStack = ({
  navigation,
}: RootDrawerScreenProps<"Investments">) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Investments"
        component={InvestmentsScreen}
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
        name="InvestmentDetails"
        options={{
          headerShown: true,
          headerBackVisible: true,
          headerTitleStyle: { color: "white" },
          headerTintColor: "white",
          headerStyle: { backgroundColor: colors.red["400"] },
        }}
        component={InvestmentDetailsScreen}
      ></Stack.Screen>
    </Stack.Navigator>
  );
};
