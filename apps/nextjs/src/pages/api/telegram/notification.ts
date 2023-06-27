import type { NextApiRequest, NextApiResponse } from "next";

import { getTelegramIntegration } from "@monetas/api/src/repository/telegram";
import { getTransaction } from "@monetas/api/src/repository/transactions";
import { getUnverifiedTransaction } from "@monetas/api/src/repository/unverifiedTransaction";
import {
  forUser,
  prisma as originalPrisma,
  type PrismaClient,
} from "@monetas/db";

import {
  NotificationType,
  type TransactionNotification,
} from "~/utils/constants";
import {
  TELEGRAM_SECRET_HEADER,
  sendTransactionMessage,
} from "~/utils/telegram";

async function sendUnverifiedTransactionNotification(
  id: string,
  chatId: string,
  prisma: PrismaClient,
) {
  const transaction = await getUnverifiedTransaction(id, prisma);
  const message = `New transaction detected💰\nAmount: ${transaction.amount} ₹\nType: ${transaction.type}\nAccount number: ${transaction.sourceAccount?.accountNumber}\nPayee: ${transaction.payeeAlias}`;
  const response = await sendTransactionMessage(message, chatId, id);
  console.log(JSON.stringify(response));
  return response.status === 200;
}

async function sendVerifiedTransactionNotification(
  id: string,
  chatId: string,
  prisma: PrismaClient,
) {
  const transaction = await getTransaction(id, prisma);
  const message = `New transaction detected💰\nAmount: ${transaction.amount} ₹\nType: ${transaction.type}\nAccount: ${transaction.sourceAccount.name}\nPayee: ${transaction.payee.name}\nCategory: ${transaction.category.name}`;
  const response = await sendTransactionMessage(message, chatId);
  console.log(JSON.stringify(response));
  return response.status === 200;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (!authorizeRequestFromTG(request)) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (request.method === "POST") {
    const notification = request.body as TransactionNotification;
    const prisma = originalPrisma.$extends(
      forUser(notification.userId),
    ) as PrismaClient;
    const telegramDetails = await getTelegramIntegration(prisma);
    let isNotificationSent = false;
    switch (notification.type) {
      case NotificationType.NEW_TRANSACTION_UNVERIFIED:
        isNotificationSent = await sendUnverifiedTransactionNotification(
          notification.transactionId,
          telegramDetails.chatId,
          prisma,
        );
        break;
      case NotificationType.NEW_TRANSACTION_VERIFIED:
        isNotificationSent = await sendVerifiedTransactionNotification(
          notification.transactionId,
          telegramDetails.chatId,
          prisma,
        );
        break;
    }
    if (isNotificationSent) {
      response
        .status(200)
        .json({ message: "Notification sent to " + telegramDetails.chatId });
      return;
    }
    response.status(400).json({ error: "Invalid request" });
    return;
  }
  response.status(400).json({ error: "Invalid request" });
}

export function authorizeRequestFromTG(request: NextApiRequest) {
  return (
    request.headers[TELEGRAM_SECRET_HEADER] ===
    process.env.TELEGRAM_SECRET_TOKEN
  );
}
