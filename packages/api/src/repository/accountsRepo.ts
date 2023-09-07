import { type Prisma, type PrismaClient } from "@prisma/client";

export type AccountBalanceHistory = {
  date: Date;
  avg: number;
};

export const searchAccounts = (search: string, client: PrismaClient) => {
  return client.financialAccount.findMany({
    include: { accountType: true, accountProvider: true },
    orderBy: { name: "asc" },
    where: {
      OR: [{ name: { search: search } }, { accountNumber: { search: search } }],
    },
  });
};
export const getAccounts = (
  providerName: string,
  typeId: string,
  client: PrismaClient,
) =>
  client.financialAccount.findMany({
    include: { accountType: true, accountProvider: true },
    orderBy: { name: "asc" },
    where:
      providerName || typeId
        ? {
            accountProvider: {
              name: {
                equals: providerName,
              },
            },
            accountTypeId: typeId,
          }
        : undefined,
  });

export const getAccountTypes = (client: PrismaClient) =>
  client.financialAccountType.findMany({ orderBy: { name: "asc" } });

export const getAccountProviders = (client: PrismaClient) =>
  client.financialAccountProvider.findMany({ orderBy: { name: "asc" } });

export const addAccount = (
  account: Prisma.FinancialAccountCreateInput,
  client: PrismaClient,
) => client.financialAccount.create({ data: account });

export const deleteAccount = (id: string, client: PrismaClient) =>
  client.financialAccount.delete({ where: { id } });

export const updateAccount = (
  id: string,
  account: Prisma.FinancialAccountUpdateInput,
  client: PrismaClient,
) => {
  return client.financialAccount.update({ where: { id }, data: account });
};

export const getMatchingAccountByName = (
  name: string,
  client: PrismaClient,
) => {
  return client.financialAccount.findFirst({
    where: { name: { search: name } },
  });
};

export const getMatchingAccountByNumber = (
  number: string,
  client: PrismaClient,
) => {
  return client.financialAccount.findFirst({
    where: { accountNumber: { search: number } },
  });
};

export const logAccountBalance = (
  balances: Prisma.AccountBalanceHistoryCreateManyInput[],
  client: PrismaClient,
) => {
  return client.accountBalanceHistory.createMany({ data: balances });
};

export const getAccountBalanceHistory = (
  start: Date,
  end: Date,
  client: PrismaClient,
) => {
  return client.$queryRaw<
    AccountBalanceHistory[]
  >`SELECT date_trunc('day',"date"::date) as "date", avg(balance)
                                              FROM "AccountBalanceHistory"
                                              where "date" >= ${start.toISOString()}::timestamp and "date" < ${end.toISOString()}::timestamp
                                              GROUP BY date_trunc('day',"date"::date) ORDER BY "date" ASC;`;
};
