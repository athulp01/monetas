import type { NextApiRequest, NextApiResponse } from "next";
import type { Credentials } from "google-auth-library";
import { google, type gmail_v1, type pubsub_v1 } from "googleapis";
import { simpleParser } from "mailparser";

import {
  getGmailIntegrationByEmailAddress,
  updateHistoryId,
} from "@monetas/api/src/repository/integration";
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
    console.log(`New transaction detected: ${JSON.stringify(transaction)}`);
    //Promise is ignored until there is a rollback mechanism
    const promises: Promise<Response>[] = [];
    promises.push(
      fetch(
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        env.BASE_URL + "/api/transaction/unverified/" + userId,
        {
          method: "POST",
          body: JSON.stringify(transaction),
          headers: new Headers({
            Accept: "application/json",
            "Content-Type": "application/json",
          }),
        },
      ),
    );
    return promises;
  } else {
    console.log("No transaction detected.");
    return Promise.reject("No transaction detected.");
  }
}

function getEmailUsingMessageId(
  messageId: string,
  userId: string,
  gmail: gmail_v1.Gmail,
) {
  return new Promise<void>((resolve, reject) => {
    gmail.users.messages
      .get({
        userId: "me",
        id: messageId,
        format: "raw",
      })
      .then((message) =>
        simpleParser(Buffer.from(message.data.raw, "base64").toString("utf-8")),
      )
      .then((parsedEmail) => {
        console.log("New email from:", parsedEmail.from.text);
        const cleanedEmailBody = cleanEmailBody(parsedEmail.html);
        const transaction: IncomingTransaction =
          getTransactionInfo(cleanedEmailBody);
        return addUnverifiedTransaction(transaction, userId);
      })
      .then((promises) => Promise.all(promises))
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.error("Error parsing email:", error);
        reject(error);
      });
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
  console.log("Retrieving emails from:", historyId);
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  return gmail.users.history
    .list({
      userId: "me",
      startHistoryId: historyId,
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
            console.log(
              "New messages added: ",
              historyItem.messagesAdded.length,
            );
            for (const messageAdded of historyItem.messagesAdded) {
              const messageId = messageAdded.message.id;
              promises.push(getEmailUsingMessageId(messageId, userId, gmail));
            }
          }
        }
        return promises;
      } else {
        console.log("No new emails since the specified historyId.");
        return Promise.reject("No new emails since the specified historyId.");
      }
    })
    .then((promises) => Promise.all(promises))
    .catch((error) => {
      console.log("An error occurred:", error);
    });
}

interface GmailNotificationData {
  emailAddress: string;
  historyId: string;
}
const prisma = originalPrisma.$extends(bypassRLS()) as PrismaClient;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const notification = req.body as pubsub_v1.Schema$ReceivedMessage;
    const data = JSON.parse(
      atob(notification.message.data),
    ) as GmailNotificationData;
    const emailId = data.emailAddress;
    const historyId = data.historyId;

    // Process the received notification
    console.log("Received Gmail notification from:", emailId);
    getGmailIntegrationByEmailAddress(emailId, prisma)
      .then((gmailOauthDetails) => {
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
        res.status(200).end();
      })
      .catch((error) => {
        console.error("Error retrieving Gmail integration:", error);
        res.status(500).end();
      });

    // Acknowledge the notification to Gmail
    console.log("Acknowledging Gmail notification from:", emailId);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
