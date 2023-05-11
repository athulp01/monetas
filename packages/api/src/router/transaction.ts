import { z } from "zod";


import {
  type Prisma,
  type PrismaClient,
  TRANSACTION_TYPE,
} from "@prisma/client";
import moment from "moment";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import {
  addTransaction,
  deleteTransaction,
  getTransaction,
  getTransactions,
  getTransactionsCount, updateTransaction
} from "../repository/transactions";
import { updateAccount } from "../repository/account";
import { getBudgetByCategoryId, updateBudgetSpent } from "../repository/budget";

export const transactionRouter = createTRPCRouter({
  listTransactions: protectedProcedure
    .input(
      z.object({
        page: z.number().min(0),
        perPage: z.number().min(1).default(10),
        month: z.date(),
      })
    )
    .query(async ({ input, ctx }) => {
      const transactionList = await getTransactions(
        input.page,
        input.perPage,
        input.month,
        ctx.prisma
      );
      const totalCount = await getTransactionsCount(input.month, ctx.prisma);
      return {
        totalCount,
        transactions: transactionList,
      };
    }),
  addTransaction: publicProcedure
    .input(
      z.object({
        amount: z.number().min(0),
        type: z.nativeEnum(TRANSACTION_TYPE),
        sourceAccountId: z.string().uuid(),
        payeeId: z.string().uuid().optional(),
        transferredAccountId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        timeCreated: z.date().optional(),
      })
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
      };
      switch (input.type) {
        case TRANSACTION_TYPE.CREDIT:
          return await ctx.prisma.$transaction(async (tx ) => {
            await addTransaction(payload, tx as PrismaClient);
            await updateAccount(
              input.sourceAccountId,
              { balance: { increment: input.amount } },
              tx as PrismaClient
            );
          });
        case TRANSACTION_TYPE.DEBIT:
          return await ctx.prisma.$transaction(async (tx) => {
            const transaction = await addTransaction(payload, tx as PrismaClient)
            await updateAccount(
              input.sourceAccountId,
              { balance: { decrement: input.amount } },
              tx as PrismaClient
            );
            const budget = await getBudgetByCategoryId(
              transaction.timeCreated,
              transaction.categoryId,
              tx as PrismaClient
            );
            if (budget) {
              await updateBudgetSpent(
                input.categoryId,
                moment(transaction.timeCreated).startOf("month").toDate(),
                { increment: transaction.amount },
                tx as PrismaClient
              );
            }
          });
        case TRANSACTION_TYPE.TRANSFER:
          return await ctx.prisma.$transaction([
            addTransaction(payload, ctx.prisma),
            updateAccount(
              input.sourceAccountId,
              { balance: { decrement: input.amount } },
              ctx.prisma
            ),
            updateAccount(
              input.transferredAccountId,
              { balance: { increment: input.amount } },
              ctx.prisma
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
              tx
            );
            break;
          case TRANSACTION_TYPE.DEBIT:
            await updateAccount(
              deletedTransacion.sourceAccountId,
              { balance: { increment: deletedTransacion.amount } },
              tx
            );
            const budget = await getBudgetByCategoryId(
              deletedTransacion.timeCreated,
              deletedTransacion.categoryId,
              tx
            );
            if (budget) {
              await updateBudgetSpent(
                deletedTransacion.categoryId,
                moment(deletedTransacion.timeCreated).startOf("month").toDate(),
                { decrement: deletedTransacion.amount },
                tx
              );
            }
            break;
          case TRANSACTION_TYPE.TRANSFER:
            await updateAccount(
              deletedTransacion.sourceAccountId,
              { balance: { increment: deletedTransacion.amount } },
              tx
            );
            await updateAccount(
              deletedTransacion.transferredAccountId,
              { balance: { decrement: deletedTransacion.amount } },
              tx
            );
        }
        return deletedTransacion;
      });
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
      })
    )
    .mutation(async ({ input, ctx }) => {
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
      };
      await ctx.prisma.$transaction(async (tx: PrismaClient) => {
        const oldTransaction = await getTransaction(input.id, tx);
        const budget = await getBudgetByCategoryId(
          oldTransaction.timeCreated,
          oldTransaction.categoryId,
          tx
        );
        switch (oldTransaction.type) {
          case TRANSACTION_TYPE.CREDIT:
            await updateAccount(
              oldTransaction.sourceAccountId,
              { balance: { decrement: oldTransaction.amount } },
              tx
            );
            break;
          case TRANSACTION_TYPE.DEBIT:
            await updateAccount(
              oldTransaction.sourceAccountId,
              { balance: { increment: oldTransaction.amount } },
              tx
            );
            if (budget) {
              await updateBudgetSpent(
                oldTransaction.categoryId,
                moment(oldTransaction.timeCreated).startOf("month").toDate(),
                { decrement: oldTransaction.amount },
                tx
              );
            }
            break;
          case TRANSACTION_TYPE.TRANSFER:
            await updateAccount(
              oldTransaction.sourceAccountId,
              { balance: { increment: oldTransaction.amount } },
              tx
            );
            await updateAccount(
              oldTransaction.transferredAccountId,
              { balance: { decrement: oldTransaction.amount } },
              tx
            );
            break;
        }
        const updatedTransaction = await updateTransaction(
          input.id,
          payload,
          ctx.prisma
        );

        switch (updatedTransaction.type) {
          case TRANSACTION_TYPE.CREDIT:
            await updateAccount(
              updatedTransaction.sourceAccountId,
              { balance: { increment: updatedTransaction.amount } },
              tx
            );
            break;
          case TRANSACTION_TYPE.DEBIT:
            await updateAccount(
              updatedTransaction.sourceAccountId,
              { balance: { decrement: updatedTransaction.amount } },
              tx
            );
            if (budget) {
              await updateBudgetSpent(
                updatedTransaction.categoryId,
                moment(updatedTransaction.timeCreated)
                  .startOf("month")
                  .toDate(),
                { increment: updatedTransaction.amount },
                tx
              );
            }
            break;
          case TRANSACTION_TYPE.TRANSFER:
            await updateAccount(
              updatedTransaction.sourceAccountId,
              { balance: { decrement: updatedTransaction.amount } },
              tx
            );
            await updateAccount(
              updatedTransaction.transferredAccountId,
              { balance: { increment: updatedTransaction.amount } },
              tx
            );
            break;
        }

        return updatedTransaction;
      });
    }),
});
