import {
  TRANSACTION_TYPE,
  type Prisma,
  type PrismaClient,
} from "@prisma/client";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

import { bypassRLS, prisma as originalPrisma } from "../index";
import * as AccountsData from "./accounts.json";
import * as CategoriesData from "./categories.json";
import * as PayeeData from "./payees.json";
import * as ProvidersData from "./providers.json";
import * as TypesData from "./types.json";

const createRandomTransactionBetweenDates = (
  count: number,
  startDate: Date,
  endDate: Date,
) => {
  const transactions: Prisma.TransactionCreateManyInput[] = [];
  for (let i = 0; i < count; i++) {
    const transaction = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      id: uuidv4() as string,
      amount: Math.floor(Math.random() * 10000),
      timeCreated: new Date(
        startDate.getTime() +
          Math.random() * (endDate.getTime() - startDate.getTime()),
      ),
      categoryId:
        CategoriesData[Math.floor(Math.random() * CategoriesData.length)].id,
      sourceAccountId:
        AccountsData[Math.floor(Math.random() * AccountsData.length)].id,
      payeeId: PayeeData[Math.floor(Math.random() * PayeeData.length)].id,
      type:
        Math.random() > 0.5 ? TRANSACTION_TYPE.CREDIT : TRANSACTION_TYPE.DEBIT,
    };
    transactions.push(transaction);
  }
  return transactions;
};

const createRandomPayees = async (count: number, client: PrismaClient) => {
  for (let i = 0; i < count; i++) {
    const payee: Prisma.PayeeCreateInput = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      id: uuidv4() as string,
      name: `Payee ${i}`,
      categories: {
        connect: [
          {
            id: CategoriesData[
              Math.floor(Math.random() * CategoriesData.length)
            ].id,
          },
          {
            id: CategoriesData[
              Math.floor(Math.random() * CategoriesData.length)
            ].id,
          },
        ],
      },
    };
    await client.payee.create({ data: payee });
  }
};

async function main() {
  const prisma = originalPrisma.$extends(bypassRLS());
  CategoriesData.forEach(async (category) => {
    await prisma.category.upsert({
      where: {
        name: category.name,
      },
      update: {
        type: category.type as TRANSACTION_TYPE,
        name: category.name,
        icon: category.icon,
      },
      create: {
        type: category.type as TRANSACTION_TYPE,
        name: category.name,
        icon: category.icon,
      },
    });
  });

  TypesData.forEach(async (type) => {
    await prisma.financialAccountType.upsert({
      where: {
        name: type.name,
      },
      update: {
        name: type.name,
      },
      create: {
        name: type.name,
      },
    });
  });

  ProvidersData.forEach(async (provider) => {
    await prisma.financialAccountProvider.upsert({
      where: {
        name: provider.name,
      },
      update: {
        name: provider.name,
        icon: provider.icon,
      },
      create: {
        name: provider.name,
        icon: provider.icon,
      },
    });
  });

  if (process.env.NODE_ENV !== "production") {
    await createRandomPayees(10, prisma as PrismaClient);

    const accounts: Prisma.FinancialAccountCreateManyInput[] = [];
    AccountsData.forEach((account) => {
      accounts.push({
        id: account.id,
        name: account.name,
        balance: account.balance,
        accountTypeId: account.accountTypeId,
        accountProviderId: account.accountProviderId,
        accountNumber: account.accountNumber,
      });
    });
    await prisma.financialAccount.createMany({
      data: accounts,
      skipDuplicates: true,
    });

    await prisma.transaction.createMany({
      data: createRandomTransactionBetweenDates(
        1000,
        moment().startOf("year").toDate(),
        moment().endOf("year").toDate(),
      ),
      skipDuplicates: true,
    });
  }
}

main()
  .then(async () => {
    await originalPrisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await originalPrisma.$disconnect();
    process.exit(1);
  });
