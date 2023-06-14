import { INVESTMENT_TYPE, TRANSACTION_TYPE } from "@prisma/client";

export const TransactionTypeOptions = [
  { name: "Credit", id: TRANSACTION_TYPE.CREDIT },
  { name: "Debit", id: TRANSACTION_TYPE.DEBIT },
  { name: "Transfer", id: TRANSACTION_TYPE.TRANSFER },
];

export const InvestmentTypeOptions = [
  { name: "Stock", id: INVESTMENT_TYPE.STOCK },
  { name: "Mutual Fund", id: INVESTMENT_TYPE.MUTUAL_FUND },
];

export enum NotificationType {
  NEW_TRANSACTION_VERIFIED = "NEW_TRANSACTION_VERIFIED",
  NEW_TRANSACTION_UNVERIFIED = "NEW_TRANSACTION_UNVERIFIED",
}

export interface TransactionNotification {
  type: NotificationType;
  transactionId: string;
  userId: string;
}
