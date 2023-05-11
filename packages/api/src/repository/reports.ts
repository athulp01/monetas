import { type PrismaClient, TRANSACTION_TYPE } from '@prisma/client'
import moment from 'moment'

export type ExpenseReportDaily = {
  timeCreated: Date
  sum: number
}[]

export type ExpenseReportCategory = {
  id: string
  name: string
  sum: number
}[]

export type ExpenseReportPayee = {
  id: string
  name: string
  sum: number
}[]

export const getTotalExpensesForTheMonth = (month: Date, client: PrismaClient) => {
  const momentDate = moment(month)
  return client.transaction.aggregate({
    _sum: { amount: true },
    where: {
      AND: [
        {
          timeCreated: {
            gte: momentDate.startOf('month').toISOString(),
          },
        },
        {
          timeCreated: {
            lte: momentDate.endOf('month').toISOString(),
          },
        },
        {
          type: {
            equals: TRANSACTION_TYPE.DEBIT,
          },
        },
      ],
    },
  })
}

export const getTotalIncomeForTheMonth = (month: Date, client: PrismaClient) => {
  const momentDate = moment(month)
  return client.transaction.aggregate({
    _sum: { amount: true },
    where: {
      AND: [
        {
          timeCreated: {
            gte: momentDate.startOf('month').toISOString(),
          },
        },
        {
          timeCreated: {
            lte: momentDate.endOf('month').toISOString(),
          },
        },
        {
          type: {
            equals: TRANSACTION_TYPE.CREDIT,
          },
        },
      ],
    },
  })
}

export const getNetWorth = (client: PrismaClient) => {
  return client.financialAccount.aggregate({ _sum: { balance: true } })
}

export const getNetExpensePerDay = (
  rangeStart: Date,
  rangeEnd: Date,
  precision: 'day' | 'month',
  client: PrismaClient
) => {
  return client.$queryRaw<ExpenseReportDaily>`SELECT date_trunc('day',"timeCreated"::date) as "timeCreated", sum(amount)
FROM "Transaction"
where type = 'DEBIT' and "timeCreated" >= ${rangeStart.toISOString()}::timestamp and "timeCreated" < ${rangeEnd.toISOString()}::timestamp
GROUP BY date_trunc('day',"timeCreated"::date)
ORDER BY "timeCreated" ASC;`
}

export const getNetIncomePerDay = (rangeStart: Date, rangeEnd: Date, client: PrismaClient) => {
  return client.$queryRaw<ExpenseReportDaily>`SELECT date_trunc('month',"timeCreated"::date) as "timeCreated", sum(amount)
FROM "Transaction"
where type = 'CREDIT' and "timeCreated" >= ${rangeStart.toISOString()}::timestamp and "timeCreated" < ${rangeEnd.toISOString()}::timestamp
GROUP BY date_trunc('month',"timeCreated"::date)
ORDER BY "timeCreated" ASC;`
}

export const getNetExpensePerCategory = (
  rangeStart: Date,
  rangeEnd: Date,
  client: PrismaClient
) => {
  return client.$queryRaw<ExpenseReportCategory>`
select C.id, C.name, sum(T.amount)
from "Transaction" T
inner join "Category" C on C.id = T."categoryId"
where T.type = 'DEBIT' and T."timeCreated" >= ${rangeStart.toISOString()}::timestamp and T."timeCreated" < ${rangeEnd.toISOString()}::timestamp
group by C.id;`
}

export const getNetExpensePerPayee = (rangeStart: Date, rangeEnd: Date, client: PrismaClient) => {
  return client.$queryRaw<ExpenseReportPayee>`
select P.id, P.name, sum(T.amount)
from "Transaction" T
inner join "Payee" P on P.id = T."payeeId"
where T.type = 'DEBIT' and T."timeCreated" >= ${rangeStart.toISOString()}::timestamp and T."timeCreated" < ${rangeEnd.toISOString()}::timestamp
group by P.id;`
}
