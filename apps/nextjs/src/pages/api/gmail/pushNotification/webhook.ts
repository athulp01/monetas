import type { NextApiRequest, NextApiResponse } from "next";
import type { Credentials } from "google-auth-library";
import { google, type gmail_v1, type pubsub_v1 } from "googleapis";
import { simpleParser } from "mailparser";

import {
  getGmailIntegrationByEmailAddress,
  updateHistoryId,
} from "@monetas/api/src/repository/integrationsRepo";
import {
  bypassRLS,
  prisma as originalPrisma,
  type PrismaClient,
} from "@monetas/db";
import { getTransactionInfo, type IncomingTransaction } from "@monetas/parser";

import { env } from "~/env.mjs";

const cleanEmailBody = (body: string | false) => {
  if (body) {
    let parsedEmail = body
      .replace(/<head>[\s\S]*?<\/head>/gi, "")
      .replace(/(<([^>]+)>)/gi, "")
      .toLowerCase();
    const salutationRegex = /Dear/i;
    const closingRegex = /(Sincerely|Regards)/i;

    const salutationMatch = parsedEmail.match(salutationRegex);
    const closingMatch = parsedEmail.match(closingRegex);

    if (salutationMatch?.index && closingMatch?.index) {
      const startIndex = salutationMatch.index + salutationMatch[0].length;
      const endIndex = closingMatch.index;
      parsedEmail = parsedEmail.substring(startIndex, endIndex).trim();
    }
    return parsedEmail;
  }
  return "";
};

function addUnverifiedTransaction(
  transaction: IncomingTransaction,
  userId: string,
) {
  if (
    transaction.amount &&
    typeof transaction.amount === "number" &&
    transaction.amount > 0
  ) {
    console.info(
      `Adding unverified transaction for ${userId} with amount ${transaction.amount} and type ${transaction.type}`,
    );
    //Promise is ignored until there is a rollback mechanism
    void fetch(env.BASE_URL + "/api/transaction/unverified/" + userId, {
      method: "POST",
      body: JSON.stringify(transaction),
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
    });
  }
}

async function getEmailUsingMessageId(
  messageId: string,
  userId: string,
  gmail: gmail_v1.Gmail,
) {
  await gmail.users.messages
    .get({
      userId: "me",
      id: messageId,
      format: "raw",
    })
    .then((message) => {
      console.info(`Fetched email with messageId ${messageId} for ${userId}`);
      return simpleParser(
        Buffer.from(message.data.raw, "base64").toString("utf-8"),
      );
    })
    .then((parsedEmail) => {
      const cleanedEmailBody = cleanEmailBody(parsedEmail.html);
      const transaction: IncomingTransaction =
        getTransactionInfo(cleanedEmailBody);
      console.info(
        `Parsed email with messageId ${messageId} for ${userId}, Sender: ${parsedEmail.from.text}`,
      );
      addUnverifiedTransaction(transaction, userId);
    })
    .catch((error) => {
      console.error(
        `Error with messageId ${messageId} for ${userId}: ${error}`,
      );
    });
}

function getEmailsUsingHistoryId(
  userId: string,
  historyId: string,
  credentials: Credentials,
) {
  const oAuth2Client = new google.auth.OAuth2(
    env.NEXT_PUBLIC_GMAIL_OAUTH_CLIENT_ID,
    env.GMAIL_OAUTH_CLIENT_SECRET,
    env.NEXT_PUBLIC_GMAIL_OAUTH_REDIRECT_URL,
  );
  oAuth2Client.setCredentials(credentials);
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  return gmail.users.history
    .list({
      userId: "me",
      startHistoryId: historyId,
      historyTypes: ["messageAdded"],
    })
    .then((response) => {
      const { history } = response.data;
      const promises: Promise<void>[] = [];
      if (history && history.length > 0) {
        for (const historyItem of history) {
          if (
            historyItem.messagesAdded &&
            historyItem.messagesAdded.length > 0
          ) {
            console.info(
              `Found ${historyItem.messagesAdded.length} new emails for ${userId} since historyId ${historyId} and current historyId ${historyItem.id}`,
            );
            for (const messageAdded of historyItem.messagesAdded) {
              const messageId = messageAdded.message.id;
              promises.push(getEmailUsingMessageId(messageId, userId, gmail));
            }
          }
        }
        return promises;
      } else {
        console.info(
          `No new emails found for ${userId} since historyId ${historyId}`,
        );
        return Promise.reject("No new emails since the specified historyId.");
      }
    })
    .then((promises) => Promise.all(promises))
    .catch((error) => {
      console.error("An error occurred:", error);
    });
}

interface GmailNotificationData {
  emailAddress: string;
  historyId: string;
}
const prisma = originalPrisma.$extends(bypassRLS()) as PrismaClient;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.info("/api/gmail/pushNotification/webhook invoked");
  if (req.method === "POST") {
    const notification = req.body as pubsub_v1.Schema$ReceivedMessage;
    const data = JSON.parse(
      atob(notification.message.data),
    ) as GmailNotificationData;
    const emailId = data.emailAddress;
    const historyId = data.historyId;

    console.info(
      `Received notification for ${emailId} with historyId ${historyId}`,
    );
    await getGmailIntegrationByEmailAddress(emailId, prisma)
      .then((gmailOauthDetails) => {
        if (!gmailOauthDetails) {
          return Promise.reject(`No Gmail integration found for ${emailId}`);
        }
        console.info(
          `Matching Gmail integration found for ${emailId} using userId ${gmailOauthDetails.userId}`,
        );
        return {
          credentials: {
            access_token: gmailOauthDetails.accessToken,
            refresh_token: gmailOauthDetails.refreshToken,
            expiry_date: parseInt(gmailOauthDetails.expiry, 10),
          },
          userId: gmailOauthDetails.userId,
          historyId: gmailOauthDetails.historyId,
        };
      })
      .then((details) => {
        return getEmailsUsingHistoryId(
          details.userId,
          details.historyId,
          details.credentials,
        );
      })
      .then(() => {
        //TODO: Update the historyId in the database only if the emails were successfully processed
        return updateHistoryId(historyId.toString(), emailId, prisma);
      })
      .then(() => {
        // Acknowledge the notification to Gmail
        console.info(
          `Acknowledging notification for ${emailId} with historyId ${historyId}`,
        );
        res.status(200).end();
      })
      .catch((error) => {
        console.error(
          `Error processing notification for ${emailId} with historyId ${historyId}: ${error}`,
        );
        res.status(500).end();
      });
  } else {
    console.error("Invalid method");
    res.status(405).end(); // Method Not Allowed
  }
}
