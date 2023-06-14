import type { NextApiRequest, NextApiResponse } from "next";
import { type FinancialAccount } from "@prisma/client";

import {
  getMatchingAccountByName,
  getMatchingAccountByNumber,
} from "@monetas/api/src/repository/account";
import { getMatchingPayee } from "@monetas/api/src/repository/payee";
import { addTransaction } from "@monetas/api/src/repository/transactions";
import { addUnverifiedTransaction } from "@monetas/api/src/repository/unverifiedTransaction";
import {
  forUser,
  prisma as originalPrisma,
  type PrismaClient,
} from "@monetas/db";
import { type IncomingTransaction } from "@monetas/parser";

import {
  NotificationType,
  type TransactionNotification,
} from "~/utils/constants";
import { TELEGRAM_SECRET_HEADER } from "~/utils/telegram";
import { env } from "~/env.mjs";

const sendNotifications = (notification: TransactionNotification) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const url = new URL("api/telegram/notification", env.BASE_URL);
  console.log("Sending notification to:", url.toString());
  return fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [TELEGRAM_SECRET_HEADER]: process.env.TELEGRAM_SECRET_TOKEN,
    },
    body: JSON.stringify(notification),
  });
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const { userId } = request.query;
  if (!userId || Array.isArray(userId)) {
    return response.status(400).json({ error: "Invalid request" });
  }
  const prisma = originalPrisma.$extends(forUser(userId)) as PrismaClient;
  if (request.method === "POST") {
    const transaction = request.body as IncomingTransaction;
    console.log(`New transaction detected ${JSON.stringify(transaction)}`);
    let account: FinancialAccount = null;
    if (transaction?.sourceAccount?.number) {
      account = await getMatchingAccountByNumber(
        transaction?.sourceAccount.number,
        prisma,
      );
    } else if (transaction?.sourceAccount?.name) {
      account = await getMatchingAccountByName(
        transaction?.sourceAccount.name,
        prisma,
      );
    }
    const payee = await getMatchingPayee(transaction?.payee, prisma);
    console.log(account, payee);
    if (account && payee) {
      const addTransactionResponse = await addTransaction(
        {
          amount: transaction.amount,
          type: transaction.type,
          sourceAccount: account ? { connect: { id: account.id } } : undefined,
          payee: payee ? { connect: { id: payee.id } } : undefined,
          category: payee
            ? { connect: { id: payee.categories[0].id } }
            : undefined,
        },
        prisma,
      );
      console.log(addTransactionResponse);
      await sendNotifications({
        type: NotificationType.NEW_TRANSACTION_VERIFIED,
        transactionId: addTransactionResponse.id,
        userId,
      });
    } else {
      const dbResponse = await addUnverifiedTransaction(
        {
          amount: transaction.amount,
          type: transaction.type,
          sourceAccount: account ? { connect: { id: account.id } } : undefined,
          payee: payee ? { connect: { id: payee.id } } : undefined,
          category: payee
            ? { connect: { id: payee.categories[0]?.id } }
            : undefined,
          payeeAlias: payee ? undefined : transaction.payee,
        },
        prisma,
      );
      console.log(dbResponse);
      await sendNotifications({
        type: NotificationType.NEW_TRANSACTION_UNVERIFIED,
        transactionId: dbResponse.id,
        userId,
      });
    }
    response.json({ status: "ok" });
  }
}