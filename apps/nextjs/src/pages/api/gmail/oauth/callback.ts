import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { google } from "googleapis";

import { addGmailIntegration } from "@monetas/api/src/repository/integration";
import {
  forUser,
  prisma as originalPrisma,
  type PrismaClient,
} from "@monetas/db";

import { env } from "~/env.mjs";

const gmailApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log("Gmail callback");
    const auth = getAuth(req);
    if (auth.userId === null) {
      throw new Error("Not authenticated");
    }
    const prisma = originalPrisma.$extends(
      forUser(auth.userId),
    ) as PrismaClient;
    const code = req.query.code as string;
    const oauth2Client = new google.auth.OAuth2(
      env.NEXT_PUBLIC_GMAIL_OAUTH_CLIENT_ID,
      env.GMAIL_OAUTH_CLIENT_SECRET,
      env.NEXT_PUBLIC_GMAIL_OAUTH_REDIRECT_URL,
    );
    const { tokens } = await oauth2Client.getToken(code);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.NEXT_PUBLIC_GMAIL_OAUTH_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    console.log("Setting up watch");
    const watchResponse = await gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName: env.PUB_SUB_TOPIC_NAME,
        labelIds: ["INBOX"],
      },
    });
    await addGmailIntegration(
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiry: tokens.expiry_date.toString(),
        historyId: watchResponse.data.historyId,
        emailId: payload.email,
      },
      prisma,
    );
    console.log("Watch has been set up successfully");
    res.redirect("/settings");
  } catch (error) {
    console.error("Error fetching Gmail messages:", error);
    res.redirect("/settings");
  }
};

export default gmailApiHandler;
