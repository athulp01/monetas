import { type Prisma, type PrismaClient } from '@prisma/client'

export const getAccounts = (client: PrismaClient) =>
  client.financialAccount.findMany({ include: { accountType: true, accountProvider: true } })

export const getAccountTypes = (client: PrismaClient) => client.financialAccountType.findMany()

export const getAccountProviders = (client: PrismaClient) =>
  client.financialAccountProvider.findMany()

export const addAccount = (account: Prisma.FinancialAccountCreateInput, client: PrismaClient) =>
  client.financialAccount.create({ data: account })

export const deleteAccount = (id: string, client: PrismaClient) =>
  client.financialAccount.delete({ where: { id } })

export const updateAccount = (
  id: string,
  account: Prisma.FinancialAccountUpdateInput,
  client: PrismaClient
) => {
  return client.financialAccount.update({ where: { id }, data: account })
}

export const getMatchingAccountByName = (name: string, client: PrismaClient) => {
  return client.financialAccount.findFirst({ where: { name: { search: name } } })
}

export const getMatchingAccountByNumber = (number: string, client: PrismaClient) => {
  return client.financialAccount.findFirst({ where: { accountNumber: { search: number } } })
}
