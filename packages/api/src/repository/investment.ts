import { type Prisma, type PrismaClient } from '@prisma/client'
import yahooFinance from 'yahoo-finance2'

export const getInvestments = (client: PrismaClient) => client.investment.findMany()

export const addInvestment = (investment: Prisma.InvestmentCreateInput, client: PrismaClient) =>
  client.investment.create({ data: investment })

export const deleteInvestment = (id: string, client: PrismaClient) =>
  client.investment.delete({ where: { id } })

export const updateInvestment = (
  id: string,
  investment: Prisma.InvestmentUpdateInput,
  client: PrismaClient
) => {
  return client.investment.update({ where: { id }, data: investment })
}

export const getQuote = (symbol: string) => {
  return yahooFinance.quote(symbol)
}

export const getMatchingAccountByName = (name: string, client: PrismaClient) => {
  return client.financialAccount.findFirst({ where: { name: { search: name } } })
}

export const getMatchingAccountByNumber = (number: string, client: PrismaClient) => {
  return client.financialAccount.findFirst({ where: { accountNumber: { search: number } } })
}
