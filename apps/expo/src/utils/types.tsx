import { type DrawerScreenProps } from "@react-navigation/drawer";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";

import { type Account } from "~/components/AccountItem";
import { type Investment } from "~/components/InvestmentItem";
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
  TransactionDetails: { transaction: Partial<Transaction> };
};

export type TransactionStackScreenProps<
  Screen extends keyof TransactionsStackParamList,
> = NativeStackScreenProps<TransactionsStackParamList, Screen>;

type InvestmentsStackParamList = {
  Investments: undefined;
  InvestmentDetails: { investment: Investment };
};

export type InvestmentsStackScreenProps<
  Screen extends keyof InvestmentsStackParamList,
> = NativeStackScreenProps<InvestmentsStackParamList, Screen>;

type AccountsStackParamList = {
  Accounts: undefined;
  AccountDetails: { account: Account };
};

export type AccountStackScreenProps<
  Screen extends keyof AccountsStackParamList,
> = NativeStackScreenProps<AccountsStackParamList, Screen>;

type HomeStackParamList = {
  Home: undefined;
  TransactionListHome: undefined;
  TransactionDetailsHome: { transaction: Transaction };
};

export type HomeStackScreenProps<Screen extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, Screen>;
