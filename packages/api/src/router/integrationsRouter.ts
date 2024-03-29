import type { Credentials } from "google-auth-library";
import { google } from "googleapis";
import { z } from "zod";

import {
  deleteGmailIntegration,
  getGmailIntegration,
  updateGmailIntegration,
} from "../repository/integrationsRepo";
import {
  addTelegramIntegration,
  getTelegramIntegration,
} from "../repository/telegramRepo";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const integrationRouter = createTRPCRouter({
  getGmailIntegration: protectedProcedure.query(async ({ ctx }) => {
    return (await getGmailIntegration(ctx.prisma))
      ? { isConnected: true }
      : { isConnected: false };
  }),
  deleteGmailIntegration: protectedProcedure.mutation(async ({ ctx }) => {
    return await deleteGmailIntegration(ctx.prisma);
  }),
  getTelegramIntegration: protectedProcedure.query(async ({ ctx }) => {
    return (await getTelegramIntegration(ctx.prisma))
      ? { isConnected: true }
      : { isConnected: false };
  }),
  addTelegramIntegration: protectedProcedure
    .input(z.object({ chatId: z.string() }).required())
    .mutation(async ({ input, ctx }) => {
      return addTelegramIntegration(
        {
          chatId: input.chatId,
        },
        ctx.prisma,
      );
    }),
  revokeGmailIntegration: protectedProcedure.mutation(async ({ ctx }) => {
    const gmailIntegration = await getGmailIntegration(ctx.prisma);
    const credentials: Credentials = {
      access_token: gmailIntegration.accessToken,
      refresh_token: gmailIntegration.refreshToken,
      expiry_date: parseInt(gmailIntegration.expiry, 10),
    };
    const oAuth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GMAIL_OAUTH_CLIENT_ID,
      process.env.GMAIL_OAUTH_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_GMAIL_OAUTH_REDIRECT_URL,
    );
    oAuth2Client.setCredentials(credentials);
    const resp = await oAuth2Client.revokeCredentials();
    if (resp.status === 200) {
      await deleteGmailIntegration(ctx.prisma);
    }
    return resp;
  }),
  verifyGmailIntegration: protectedProcedure.query(async ({ ctx }) => {
    const response = {
      isTokenValid: false,
    };
    const gmailIntegration = await getGmailIntegration(ctx.prisma);
    if (gmailIntegration) {
      const credentials: Credentials = {
        access_token: gmailIntegration.accessToken,
        refresh_token: gmailIntegration.refreshToken,
        expiry_date: parseInt(gmailIntegration.expiry, 10),
      };
      const oAuth2Client = new google.auth.OAuth2(
        process.env.NEXT_PUBLIC_GMAIL_OAUTH_CLIENT_ID,
        process.env.GMAIL_OAUTH_CLIENT_SECRET,
        process.env.NEXT_PUBLIC_GMAIL_OAUTH_REDIRECT_URL,
      );
      oAuth2Client.setCredentials(credentials);
      try {
        const tokenInfo = await oAuth2Client.getAccessToken();
        if (tokenInfo?.token) {
          console.log("Access token is valid:");
          await updateGmailIntegration(
            { accessToken: tokenInfo.token, id: gmailIntegration.id },
            ctx.prisma,
          );
          response.isTokenValid = true;
        } else {
          console.error("Invalid token");
          response.isTokenValid = false;
        }
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.error("Error verifying access token:", error.message);
        response.isTokenValid = false;
      }
      if (!response.isTokenValid) {
        console.log("Token is invalid");
        // await deleteGmailIntegration(ctx.prisma);
      }
    } else {
      response.isTokenValid = false;
    }
    return response;
  }),
});
