import { type NextApiRequest, type NextApiResponse } from "next/types";
import { type Credentials } from "google-auth-library";
import { google } from "googleapis";

import {
  getGmailIntegrations,
  updateGmailIntegration,
} from "@monetas/api/src/repository/integrationsRepo";
import {
  bypassRLS,
  prisma as originalPrisma,
  type PrismaClient,
} from "@monetas/db";

const prisma = originalPrisma.$extends(bypassRLS()) as PrismaClient;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const integrations = await getGmailIntegrations(prisma);
  for (const integration of integrations) {
    //create a watch for each integration using gmail api
    const credentials: Credentials = {
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
      expiry_date: parseInt(integration.expiry, 10),
    };
    const oAuth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GMAIL_OAUTH_CLIENT_ID,
      process.env.GMAIL_OAUTH_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_GMAIL_OAUTH_REDIRECT_URL,
    );
    oAuth2Client.setCredentials(credentials);
    try {
      const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
      const watchResponse = await gmail.users.watch({
        userId: "me",
        requestBody: {
          topicName: process.env.PUB_SUB_TOPIC_NAME,
          labelIds: ["INBOX"],
        },
      });
      await updateGmailIntegration(
        {
          watchExpiry: new Date(
            parseInt(watchResponse.data.expiration.toString()),
          ),
          historyId: watchResponse.data.historyId.toString(),
          id: integration.id,
        },
        prisma,
      );
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error("Error verifying access token:", error.message);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      return res.status(500).json({ error: error.message });
    }
  }
  return res.status(200).json({ count: integrations.length });
}
