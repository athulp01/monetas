import {
  TRANSACTION_TYPE,
  type Prisma,
  type PrismaClient,
} from "@prisma/client";
import { z } from "zod";

import { updateAccount } from "../repository/accountsRepo";
import {
  getBudgetByCategoryId,
  updateBudgetSpent,
} from "../repository/budgetsRepo";
import {
  addTransaction,
  addTransactions,
  deleteTransaction,
  getTransaction,
  getTransactions,
  getTransactionsCount,
  searchTransactions,
  updateTransaction,
} from "../repository/transactionsRepo";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const transactionRouter = createTRPCRouter({
  addTransaction: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(0),
        type: z.nativeEnum(TRANSACTION_TYPE),
        sourceAccountId: z.string().uuid(),
        payeeId: z.string().uuid().optional(),
        transferredAccountId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        timeCreated: z.date().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const payload: Prisma.TransactionCreateInput = {
        amount: input.amount,
        type: input.type,
        sourceAccount: { connect: { id: input.sourceAccountId } },
        payee: input?.payeeId ? { connect: { id: input.payeeId } } : undefined,
        transferredAccount: input?.transferredAccountId
          ? { connect: { id: input.transferredAccountId } }
          : undefined,
        category: { connect: { id: input.categoryId } },
        timeCreated: input.timeCreated,
        tags: input.tags
          ? {
              connectOrCreate: input.tags?.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
      };
      switch (input.type) {
        case TRANSACTION_TYPE.CREDIT:
          return await ctx.prisma.$transaction(async (tx) => {
            await addTransaction(payload, tx as PrismaClient);
            await updateAccount(
              input.sourceAccountId,
              { balance: { increment: input.amount } },
              tx as PrismaClient,
            );
          });
        case TRANSACTION_TYPE.DEBIT:
          return await ctx.prisma.$transaction(async (tx) => {
            const transaction = await addTransaction(
              payload,
              tx as PrismaClient,
            );
            await updateAccount(
              input.sourceAccountId,
              { balance: { decrement: input.amount } },
              tx as PrismaClient,
            );
            const budget = await getBudgetByCategoryId(
              transaction.timeCreated,
              transaction.categoryId,
              tx as PrismaClient,
            );
            if (budget) {
              await updateBudgetSpent(
                budget.id,
                { increment: transaction.amount },
                tx as PrismaClient,
              );
            }
          });
        case TRANSACTION_TYPE.TRANSFER:
          return await ctx.prisma.$transaction([
            addTransaction(payload, ctx.prisma),
            updateAccount(
              input.sourceAccountId,
              { balance: { decrement: input.amount } },
              ctx.prisma,
            ),
            updateAccount(
              input.transferredAccountId,
              { balance: { increment: input.amount } },
              ctx.prisma,
            ),
          ]);
      }
    }),
  deleteTransaction: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.$transaction(async (tx: PrismaClient) => {
        const deletedTransacion = await deleteTransaction(input, tx);
        switch (deletedTransacion.type) {
          case TRANSACTION_TYPE.CREDIT:
            await updateAccount(
              deletedTransacion.sourceAccountId,
              { balance: { decrement: deletedTransacion.amount } },
              tx,
            );
            break;
          case TRANSACTION_TYPE.DEBIT:
            await updateAccount(
              deletedTransacion.sourceAccountId,
              { balance: { increment: deletedTransacion.amount } },
              tx,
            );
            const budget = await getBudgetByCategoryId(
              deletedTransacion.timeCreated,
              deletedTransacion.categoryId,
              tx,
            );
            if (budget) {
              await updateBudgetSpent(
                budget.id,
                { decrement: deletedTransacion.amount },
                tx,
              );
            }
            break;
          case TRANSACTION_TYPE.TRANSFER:
            await updateAccount(
              deletedTransacion.sourceAccountId,
              { balance: { increment: deletedTransacion.amount } },
              tx,
            );
            await updateAccount(
              deletedTransacion.transferredAccountId,
              { balance: { decrement: deletedTransacion.amount } },
              tx,
            );
        }
        return deletedTransacion;
      });
    }),
  getTags: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.transactionTags.findMany();
  }),
  importTransactions: protectedProcedure
    .input(
      z.object({
        transactions: z.array(
          z.object({
            amount: z.number().min(0),
            type: z.nativeEnum(TRANSACTION_TYPE),
            payeeId: z.string().uuid().optional(),
            categoryId: z.string().uuid().optional(),
            timeCreated: z.date().optional(),
            tags: z.array(z.string()).optional(),
          }),
        ),
        sourceAccountId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const transactions: Prisma.TransactionCreateManyInput[] =
        input.transactions.map((transaction) => {
          return {
            amount: transaction.amount,
            type: transaction.type,
            sourceAccountId: input.sourceAccountId,
            payeeId: transaction.payeeId,
            categoryId: transaction.categoryId,
            timeCreated: transaction.timeCreated,
          };
        });
      let response: Prisma.BatchPayload;
      await ctx.prisma.$transaction(
        async (prisma) => {
          response = await addTransactions(
            transactions,
            prisma as PrismaClient,
          );
          console.log("Response: ", response);
          const balanceDelta = Math.floor(
            transactions.reduce((acc, transaction) => {
              if (transaction.type === TRANSACTION_TYPE.CREDIT) {
                return acc + transaction.amount;
              }
              return acc - transaction.amount;
            }, 0),
          );

          if (balanceDelta > 0) {
            await updateAccount(
              input.sourceAccountId,
              {
                balance: { increment: balanceDelta },
              },
              prisma as PrismaClient,
            );
          } else if (balanceDelta < 0) {
            await updateAccount(
              input.sourceAccountId,
              {
                balance: { decrement: Math.abs(balanceDelta) },
              },
              prisma as PrismaClient,
            );
          }
        },
        { timeout: 20000 },
      );
      return response;
    }),
  searchTransactions: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        page: z.number().min(0),
        perPage: z.number().min(1).default(10),
        month: z.date(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const transactionList = await searchTransactions(
        input.query,
        input.page,
        input.perPage,
        input.month,
        ctx.prisma,
      );
      const totalCount = await getTransactionsCount(input.month, ctx.prisma);
      return {
        totalCount,
        transactions: transactionList,
      };
    }),
  listTransactions: protectedProcedure
    .input(
      z.object({
        page: z.number().min(0),
        query: z.string().optional(),
        perPage: z.number().min(1).default(10),
        month: z.date(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.query) {
        const transactionList = await searchTransactions(
          input.query,
          input.page,
          input.perPage,
          input.month,
          ctx.prisma,
        );
        const totalCount = await getTransactionsCount(input.month, ctx.prisma);
        return {
          totalCount,
          transactions: transactionList,
        };
      }
      const transactionList = await getTransactions(
        input.page,
        input.perPage,
        input.month,
        ctx.prisma,
      );
      const totalCount = await getTransactionsCount(input.month, ctx.prisma);
      return {
        totalCount,
        transactions: transactionList,
      };
    }),
  updateTransaction: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(0).optional(),
        id: z.string().uuid(),
        type: z.nativeEnum(TRANSACTION_TYPE).optional(),
        sourceAccountId: z.string().uuid().optional(),
        payeeId: z.string().uuid().optional(),
        transferredAccountId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        timeCreated: z.date().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.$transaction(async (tx: PrismaClient) => {
        await tx.transactionTags.createMany({
          data: input.tags.map((tag) => ({ name: tag })),
          skipDuplicates: true,
        });
        const payload: Prisma.TransactionUpdateInput = {
          amount: input?.amount,
          type: input?.type,
          sourceAccount: { connect: { id: input?.sourceAccountId } },
          payee: input.payeeId
            ? { connect: { id: input?.payeeId } }
            : { disconnect: true },
          transferredAccount: input?.transferredAccountId
            ? { connect: { id: input?.transferredAccountId } }
            : undefined,
          category: { connect: { id: input?.categoryId } },
          timeCreated: input?.timeCreated,
          tags: {
            set: input.tags.map((tag) => ({ name: tag })),
          },
        };
        const oldTransaction = await getTransaction(input.id, tx);
        const budget = await getBudgetByCategoryId(
          oldTransaction.timeCreated,
          oldTransaction.categoryId,
          tx,
        );
        switch (oldTransaction.type) {
          case TRANSACTION_TYPE.CREDIT:
            await updateAccount(
              oldTransaction.sourceAccountId,
              { balance: { decrement: oldTransaction.amount } },
              tx,
            );
            break;
          case TRANSACTION_TYPE.DEBIT:
            await updateAccount(
              oldTransaction.sourceAccountId,
              { balance: { increment: oldTransaction.amount } },
              tx,
            );
            if (budget) {
              await updateBudgetSpent(
                budget.id,
                { decrement: oldTransaction.amount },
                tx,
              );
            }
            break;
          case TRANSACTION_TYPE.TRANSFER:
            await updateAccount(
              oldTransaction.sourceAccountId,
              { balance: { increment: oldTransaction.amount } },
              tx,
            );
            await updateAccount(
              oldTransaction.transferredAccountId,
              { balance: { decrement: oldTransaction.amount } },
              tx,
            );
            break;
        }
        const updatedTransaction = await updateTransaction(
          input.id,
          payload,
          tx,
        );

        switch (updatedTransaction.type) {
          case TRANSACTION_TYPE.CREDIT:
            await updateAccount(
              updatedTransaction.sourceAccountId,
              { balance: { increment: updatedTransaction.amount } },
              tx,
            );
            break;
          case TRANSACTION_TYPE.DEBIT:
            await updateAccount(
              updatedTransaction.sourceAccountId,
              { balance: { decrement: updatedTransaction.amount } },
              tx,
            );
            if (budget) {
              await updateBudgetSpent(
                budget.id,
                { increment: updatedTransaction.amount },
                tx,
              );
            }
            break;
          case TRANSACTION_TYPE.TRANSFER:
            await updateAccount(
              updatedTransaction.sourceAccountId,
              { balance: { decrement: updatedTransaction.amount } },
              tx,
            );
            await updateAccount(
              updatedTransaction.transferredAccountId,
              { balance: { increment: updatedTransaction.amount } },
              tx,
            );
            break;
        }

        return updatedTransaction;
      });
    }),
});
