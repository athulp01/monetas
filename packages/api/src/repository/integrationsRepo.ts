import { type Prisma, type PrismaClient } from "@prisma/client";

export const addGmailIntegration = (
  integration: Prisma.GmailOauthDetailsCreateInput,
  client: PrismaClient,
) => client.gmailOauthDetails.create({ data: integration });

export const getGmailIntegration = (client: PrismaClient) =>
  client.gmailOauthDetails.findFirst();

export const getGmailIntegrations = (client: PrismaClient) =>
  client.gmailOauthDetails.findMany();

export const getGmailIntegrationByEmailAddress = (
  email: string,
  Prisma: PrismaClient,
) =>
  Prisma.gmailOauthDetails.findFirst({
    where: {
      emailId: email,
    },
  });

export const updateHistoryId = (
  historyId: string,
  email: string,
  client: PrismaClient,
) =>
  client.gmailOauthDetails.update({
    where: { emailId: email },
    data: { historyId },
  });

export const deleteGmailIntegration = (client: PrismaClient) =>
  client.gmailOauthDetails.deleteMany({});

export const updateGmailIntegration = (
  integration: Prisma.GmailOauthDetailsUpdateInput,
  client: PrismaClient,
) => {
  return client.gmailOauthDetails.update({
    where: { id: integration.id as string },
    data: integration,
  });
};
