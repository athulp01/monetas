import {
  TRANSACTION_TYPE,
  type Prisma,
  type PrismaClient,
} from "@prisma/client";
import { z } from "zod";

import { updateAccount } from "../repository/account";
import { getBudgetByCategoryId, updateBudgetSpent } from "../repository/budget";
import { addPayeeAlias } from "../repository/payee";
import { addTransaction } from "../repository/transactions";
import {
  deleteUnverifiedTransaction,
  getUnverifiedTransaction,
  getUnverifiedTransactionCount,
  getUnverifiedTransactions,
} from "../repository/unverifiedTransaction";
import {
  createTRPCRouter,
  protectedProcedure,
  telegramProcedure,
} from "../trpc";

export const unverifiedTransactionRouter = createTRPCRouter({
  listUnverifiedTransactions: protectedProcedure
    .input(
      z.object({
        page: z.number().min(0),
        perPage: z.number().min(1).default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      const unverifiedTransactions = await getUnverifiedTransactions(
        input.page,
        input.perPage,
        ctx.prisma,
      );
      const totalCount = await ctx.prisma.unverifiedTransaction.count();
      return {
        totalCount,
        unverifiedTransactions,
      };
    }),
  deleteUnverifiedTransaction: telegramProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return await deleteUnverifiedTransaction(input.id, ctx.prisma);
    }),
  getUnverifiedTransaction: telegramProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return await getUnverifiedTransaction(input.id, ctx.prisma);
    }),
  getUnverifiedTransactionCount: protectedProcedure.query(async ({ ctx }) => {
    return getUnverifiedTransactionCount(ctx.prisma);
  }),
  verifyUnverifiedTransaction: telegramProcedure
    .input(
      z.object({
        amount: z.number().min(0),
        type: z.nativeEnum(TRANSACTION_TYPE),
        sourceAccountId: z.string().uuid(),
        payeeId: z.string().uuid().optional(),
        transferredAccountId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        timeCreated: z.date().optional(),
        payeeAlias: z.string().optional(),
        unverifiedTransactionId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const payload: Prisma.TransactionCreateInput = {
        amount: input.amount,
        type: input.type,
        sourceAccount: { connect: { id: input.sourceAccountId } },
        payee: input.payeeId ? { connect: { id: input.payeeId } } : undefined,
        transferredAccount: input?.transferredAccountId
          ? { connect: { id: input.transferredAccountId } }
          : undefined,
        category: { connect: { id: input.categoryId } },
        timeCreated: input.timeCreated,
      };

      switch (input.type) {
        case TRANSACTION_TYPE.CREDIT:
          await ctx.prisma.$transaction(async (tx: PrismaClient) => {
            await addTransaction(payload, tx);
            await updateAccount(
              input.sourceAccountId,
              { balance: { increment: input.amount } },
              tx,
            );
            await deleteUnverifiedTransaction(
              input.unverifiedTransactionId,
              tx,
            );
          });
          break;
        case TRANSACTION_TYPE.DEBIT:
          await ctx.prisma.$transaction(async (tx: PrismaClient) => {
            const transaction = await addTransaction(payload, ctx.prisma);
            await updateAccount(
              input.sourceAccountId,
              { balance: { decrement: input.amount } },
              tx,
            );
            const budget = await getBudgetByCategoryId(
              transaction.timeCreated,
              transaction.categoryId,
              tx,
            );
            if (budget) {
              await updateBudgetSpent(
                budget.id,
                { increment: transaction.amount },
                tx,
              );
            }
            await deleteUnverifiedTransaction(
              input.unverifiedTransactionId,
              tx,
            );
          });
          break;
        case TRANSACTION_TYPE.TRANSFER:
          await ctx.prisma.$transaction([
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
            deleteUnverifiedTransaction(
              input.unverifiedTransactionId,
              ctx.prisma,
            ),
          ]);
      }
      if (input.payeeAlias) {
        await addPayeeAlias(input.payeeId, input.payeeAlias, ctx.prisma);
      }
      return;
    }),
});
