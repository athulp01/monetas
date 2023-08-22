export enum IAccountType {
  CREDIT_CARD = "CREDIT CARD",
  DEBIT_CARD = "DEBIT CARD",
  WALLET = "WALLET",
  ACCOUNT = "ACCOUNT",
}

export enum IBalanceKeyWordsType {
  AVAILABLE = "AVAILABLE",
  OUTSTANDING = "OUTSTANDING",
}

export interface IAccountInfo {
  type: IAccountType | null;
  provider?: string | null;
  number: string | null;
  name: string | null;
}

export interface IBalance {
  available: string | null;
  outstanding: string | null;
}

export type TMessageType = string | string[];
export type TTransactionType = "DEBIT" | "CREDIT" | null;
export type Payee = string;

export interface IncomingTransaction {
  sourceAccount: {
    name: string | null;
    number?: string | null;
  };
  amount: number | null;
  type: "CREDIT" | "DEBIT" | "TRANSFER" | null;
  payee?: string | null;
}

export interface ICombinedWords {
  regex: RegExp;
  word: string;
  type: IAccountType;
}
