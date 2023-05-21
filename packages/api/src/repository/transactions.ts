import { type Prisma, type PrismaClient } from '@prisma/client'
import moment from 'moment'

export const getTransactionsCount = (month: Date, client: PrismaClient) => {
  const dateMoment = moment(month)
  return client.transaction.count({
    where: {
      timeCreated: {
        gte: dateMoment.startOf('month').toISOString(),
        lte: dateMoment.endOf('month').toISOString(),
      },
    },
  })
}
export const getTransactions = (
  page: number,
  perPage: number,
  month: Date,
  client: PrismaClient
) => {
  const dateMoment = moment(month)
  return client.transaction.findMany({
    include: { sourceAccount: true, payee: true, transferredAccount: true, category: true },
    skip: page * perPage,
    take: perPage,
    orderBy: { timeCreated: 'desc' },
    where: {
      timeCreated: {
        gte: dateMoment.startOf('month').toISOString(),
        lte: dateMoment.endOf('month').toISOString(),
      },
    },
  })
}

export const addTransaction = (
  transaction: Prisma.TransactionCreateInput,
  client: PrismaClient
) => {
  return client.transaction.create({
    data: transaction,
    include: { sourceAccount: true, payee: true, category: true, transferredAccount: true },
  })
}

export const deleteTransaction = (id: string, client: PrismaClient) =>
  client.transaction.delete({ where: { id } })

export const updateTransaction = (
  id: string,
  transaction: Prisma.TransactionUpdateInput,
  client: PrismaClient
) => {
  return client.transaction.update({ where: { id }, data: transaction })
}

export const getTransaction = (id: string, client: PrismaClient) =>
  client.transaction.findUnique({ where: { id } })

export const getTotalExpenseForCategory = (
  categoryId: string,
  month: Date,
  client: PrismaClient
) => {
  const dateMoment = moment(month)
  return client.transaction.aggregate({
    where: {
      timeCreated: {
        gte: dateMoment.startOf('month').toISOString(),
        lte: dateMoment.endOf('month').toISOString(),
      },
      categoryId,
    },
    _sum: { amount: true },
  })
}