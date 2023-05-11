import type { NextApiRequest, NextApiResponse } from 'next'
import { sendTransactionMessage, TELEGRAM_SECRET_HEADER } from '~/utils/telegram'
import { type IncomingTransaction } from '@monetas/parser'
import { type FinancialAccount } from '@prisma/client'
import { type TransactionsList } from '~/components/transactions/TransactionsTableView'
import { getMatchingAccountByName, getMatchingAccountByNumber } from "@monetas/api/src/repository/account";
import { getMatchingPayee } from "@monetas/api/src/repository/payee";
import { addTransaction } from "@monetas/api/src/repository/transactions";
import { addUnverifiedTransaction } from "@monetas/api/src/repository/unverifiedTransaction";
import { prisma } from "@monetas/db";

async function handleUnverifiedTransaction(id: string, transaction: IncomingTransaction) {
  const message = `New transaction detected💰\nAmount: ${transaction.amount} ₹\nType: ${transaction.type}\nAccount number: ${transaction.sourceAccount.number}\nPayee: ${transaction.payee}`
  const response = await sendTransactionMessage(message, id)
  console.log(JSON.stringify(response))
  return new Response(JSON.stringify(response), { status: 200 })
}

async function handleVerifiedTransaction(transaction: TransactionsList[0]) {
  const message = `New transaction detected💰\nAmount: ${transaction.amount} ₹\nType: ${transaction.type}\nAccount: ${transaction.sourceAccount.name}\nPayee: ${transaction.payee.name}\nCategory: ${transaction.category.name}`
  const response = await sendTransactionMessage(message)
  console.log(JSON.stringify(response))
  return new Response(JSON.stringify(response), { status: 200 })
}

export function authorizeRequestFromTG(request: Request) {
  if (request.headers.get(TELEGRAM_SECRET_HEADER) !== process.env.TELEGRAM_SECRET_TOKEN) {
    return new Response('Unauthorized', { status: 403 })
  }
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  console.log('Request received')
  if (request.method === 'POST') {
    console.log(`Request received: ${request.url}`)
    const transaction = (request.body as IncomingTransaction)
    console.log(`New transaction detected ${JSON.stringify(transaction)}`)
    let account: FinancialAccount = null
    if (transaction?.sourceAccount?.number) {
      account = await getMatchingAccountByNumber(transaction?.sourceAccount.number, prisma)
    } else if (transaction?.sourceAccount?.name) {
      account = await getMatchingAccountByName(transaction?.sourceAccount.name, prisma)
    }
    const payee = await getMatchingPayee(transaction?.payee, prisma)
    console.log(account, payee)
    if (account && payee) {
      const addTransactionResponse = await addTransaction(
        {
          amount: transaction.amount,
          type: transaction.type,
          sourceAccount: account ? { connect: { id: account.id } } : undefined,
          payee: payee ? { connect: { id: payee.id } } : undefined,
          category: payee ? { connect: { id: payee.categories[0].id } } : undefined,
        },
        prisma
      )
      console.log(addTransactionResponse)
      await handleVerifiedTransaction(addTransactionResponse)
    } else {
      const dbResponse = await addUnverifiedTransaction(
        {
          amount: transaction.amount,
          type: transaction.type,
          sourceAccount: account ? { connect: { id: account.id } } : undefined,
          payee: payee ? { connect: { id: payee.id } } : undefined,
          category: payee ? { connect: { id: payee.categories[0]?.id } } : undefined,
          payeeAlias: payee ? undefined : transaction.payee,
        },
        prisma
      )
      console.log(dbResponse)
      await handleUnverifiedTransaction(dbResponse.id, transaction)
    }
    response.json({ status: 'ok' })
  }
}
