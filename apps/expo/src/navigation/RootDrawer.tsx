import * as React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import { AccountsStack } from "~/navigation/AccountsStack";
import { HomeStack } from "~/navigation/HomeStack";
import { InvestmentsStack } from "~/navigation/InvestmentsStack";
import { TransactionsStack } from "~/navigation/TransactionsStack";
import { BudgetScreen } from "~/screens/drawerScreens/BudgetScreen";
import { PayeesScreen } from "~/screens/drawerScreens/PayeesScreen";

const Drawer = createDrawerNavigator();

export function RootDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        sceneContainerStyle: { backgroundColor: "white" },
        swipeEnabled: true,
        drawerActiveTintColor: "black",
      }}
    >
      <Drawer.Screen
        name="HomeStack"
        component={HomeStack}
        options={{ headerShown: false, drawerLabel: "Home" }}
      ></Drawer.Screen>
      <Drawer.Screen
        name="TransactionsStack"
        component={TransactionsStack}
        options={{ headerShown: false, drawerLabel: "Transactions" }}
      />
      <Drawer.Screen
        name="AccountsStack"
        component={AccountsStack}
        options={{ headerShown: false, drawerLabel: "Accounts" }}
      />
      <Drawer.Screen name="Budgets" component={BudgetScreen} />
      <Drawer.Screen name="Payees" component={PayeesScreen} />
      <Drawer.Screen
        name="InvestmentsStack"
        component={InvestmentsStack}
        options={{ headerShown: false, drawerLabel: "Investments" }}
      ></Drawer.Screen>
    </Drawer.Navigator>
  );
}
