import { type Prisma, type PrismaClient } from '@prisma/client'

export const getUnverifiedTransactions = (page: number, perPage: number, client: PrismaClient) =>
  client.unverifiedTransaction.findMany({
    include: { sourceAccount: true, payee: true, transferredAccount: true, category: true },
    skip: page * perPage,
    take: perPage,
    orderBy: { timeCreated: 'desc' },
  })

export const deleteUnverifiedTransaction = (id: string, client: PrismaClient) =>
  client.unverifiedTransaction.delete({ where: { id } })

export const getUnverifiedTransaction = (id: string, client: PrismaClient) =>
  client.unverifiedTransaction.findUnique({
    where: { id },
    include: { sourceAccount: true, payee: true, transferredAccount: true, category: true },
  })

export const addUnverifiedTransaction = (
  transaction: Prisma.UnverifiedTransactionCreateInput,
  client: PrismaClient
) => {
  return client.unverifiedTransaction.create({ data: transaction })
}

export const getUnverifiedTransactionCount = (client: PrismaClient) =>
  client.unverifiedTransaction.count()
