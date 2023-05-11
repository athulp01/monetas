import * as React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import { TransactionsStack } from "~/navigation/TransactionsStack";
import { AccountsScreen } from "~/screens/drawerScreens/AccountsScreen";
import { BudgetScreen } from "~/screens/drawerScreens/BudgetScreen";
import { HomeScreen } from "~/screens/drawerScreens/HomeScreen";
import { InvestmentsScreen } from "~/screens/drawerScreens/InvestmentsScreen";
import { PayeesScreen } from "~/screens/drawerScreens/PayeesScreen";

const Drawer = createDrawerNavigator();

export function RootDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        sceneContainerStyle: { backgroundColor: "white" },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{}} />
      <Drawer.Screen
        name="Transactions"
        component={TransactionsStack}
        options={{ headerShown: false }}
      />
      <Drawer.Screen name="Accounts" component={AccountsScreen} />
      <Drawer.Screen name="Budgets" component={BudgetScreen} />
      <Drawer.Screen name="Payees" component={PayeesScreen} />
      <Drawer.Screen name="Investments" component={InvestmentsScreen} />
    </Drawer.Navigator>
  );
}
