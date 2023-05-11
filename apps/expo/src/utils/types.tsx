import { type DrawerScreenProps } from "@react-navigation/drawer";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";

import { type Transaction } from "~/components/TransactionItem";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    type RootParamList = RootStackParamList;
  }
}

type RootStackParamList = {
  Root: undefined;
  SignUp: undefined;
  SignIn: undefined;
  MyProfile: undefined;
  VerifyCode: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

type RootDrawerParamList = {
  Home: undefined;
  Transactions: undefined;
  Accounts: undefined;
  Budgets: undefined;
  Payees: undefined;
  Investments: undefined;
};
export type RootDrawerScreenProps<Screen extends keyof RootDrawerParamList> =
  DrawerScreenProps<RootDrawerParamList, Screen>;

type TransactionsStackParamList = {
  Transactions: undefined;
  TransactionDetails: { transaction: Transaction };
};

export type TransactionStackScreenProps<
  Screen extends keyof TransactionsStackParamList,
> = NativeStackScreenProps<TransactionsStackParamList, Screen>;
