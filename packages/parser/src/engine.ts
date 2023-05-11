import getAccount from "./account";
import getBalance from "./balance";
import {
  IAccountType,
  type IBalance,
  IBalanceKeyWordsType,
  type IncomingTransaction,
  type TMessageType,
  type TTransactionType,
} from "./types";
import { getProcessedMessage, padCurrencyValue, processMessage } from "./utils";

export const getTransactionAmount = (message: TMessageType): string => {
  const processedMessage = getProcessedMessage(message);
  const index = processedMessage.indexOf("rs.");

  // If "rs." does not exist
  // Return ""
  if (index === -1) {
    return "";
  }
  let money = message[index + 1];

  money = money?.replace(/,/g, "");

  // If data is false positive
  // Look ahead one index and check for valid money
  // Else return the found money
  if (Number.isNaN(Number(money))) {
    money = message[index + 2];
    money = money?.replace(/,/g, "");

    // If this is also false positive, return ""
    // Else return the found money
    if (Number.isNaN(Number(money))) {
      return "";
    }
    return padCurrencyValue(money ?? "0");
  }
  return padCurrencyValue(money ?? "0");
};

export const getTransactionType = (message: TMessageType): TTransactionType => {
  const creditPattern =
    /(?:credited|deposited|added|received|refund|repayment|revers)/gi;
  const debitPattern = /(?:debited|deducted)/gi;
  const miscPattern =
    /(?:payment|spent|paid|used\sat|charged|transaction\son|transaction\sfee|tran|booked|purchased)/gi;

  const messageStr = typeof message !== "string" ? message.join(" ") : message;

  if (debitPattern.test(messageStr)) {
    return "DEBIT";
  }
  if (creditPattern.test(messageStr)) {
    return "CREDIT";
  }
  if (miscPattern.test(messageStr)) {
    return "DEBIT";
  }

  return null;
};

export const getPayee = (message: string): string | null => {
  // if send to a upi id payee details will be after string 'vpa'
  const lower = message.toLowerCase();
  let index = lower.indexOf(" vpa ");
  let end = lower.indexOf(" ", index + 5);
  if (index > 0 && end > 0) {
    console.log(index, end);
    return message.substring(index + 5, end);
  }
  // ICICI CC
  index = lower.indexOf("info: ");
  end = lower.indexOf(".", index + 6);
  if (index > 0 && end > 0) {
    return message.substring(index + 6, end);
  }
  index = lower.indexOf(" at ");
  end = lower.indexOf(" on ", index);
  return message.substring(index + 4, end);
};

export const getTransactionInfo = (message: string): IncomingTransaction => {
  if (!message || typeof message !== "string") {
    return {
      sourceAccount: {
        name: null,
      },
      amount: null,
      type: null,
      payee: null,
    };
  }

  const processedMessage = processMessage(message);
  const account = getAccount(processedMessage);
  const payee = getPayee(message);
  const availableBalance = getBalance(
    processedMessage,
    IBalanceKeyWordsType.AVAILABLE
  );
  const transactionAmount = getTransactionAmount(processedMessage);
  const isValid =
    [availableBalance, transactionAmount, account.number].filter(
      (x) => x !== ""
    ).length >= 2;
  const transactionType = isValid ? getTransactionType(processedMessage) : null;
  const balance: IBalance = { available: availableBalance, outstanding: null };

  if (account && account.type === IAccountType.CREDIT_CARD) {
    balance.outstanding = getBalance(
      processedMessage,
      IBalanceKeyWordsType.OUTSTANDING
    );
  }
  return {
    amount: Math.round(parseFloat(transactionAmount)),
    type: transactionType,
    payee,
    sourceAccount: {
      name: account.name,
      number: account.number,
    },
  };
};
