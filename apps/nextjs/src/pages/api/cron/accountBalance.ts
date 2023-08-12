import { NextApiRequest, NextApiResponse } from "next/types";

import {
  getAccounts,
  logAccountBalance,
} from "@monetas/api/src/repository/accountsRepo";
import {
  bypassRLS,
  prisma as originalPrisma,
  type PrismaClient,
} from "@monetas/db";

const prisma = originalPrisma.$extends(bypassRLS()) as PrismaClient;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const accounts = await getAccounts(null, null, prisma);
  const payload = accounts.map((account) => ({
    accountId: account.id,
    balance: account.balance,
    date: new Date(),
  }));
  const resp = await logAccountBalance(payload, prisma);
  return res.status(200).json(resp);
}
