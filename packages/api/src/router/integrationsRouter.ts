import { z } from "zod";

import {
  deleteGmailIntegration,
  getGmailIntegration,
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
});
