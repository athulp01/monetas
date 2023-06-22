import { type Prisma, type PrismaClient } from "@prisma/client";

export const getTelegramIntegration = (client: PrismaClient) =>
  client.telegramDetails.findFirst();

export const getTelegramIntegrationByChatId = (
  chatId: string,
  client: PrismaClient,
) => client.telegramDetails.findFirst({ where: { chatId } });

export const addTelegramIntegration = (
  details: Prisma.TelegramDetailsCreateInput,
  client: PrismaClient,
) => client.telegramDetails.create({ data: details });
