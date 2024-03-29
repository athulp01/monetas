import { z } from "zod";

import {
  addAccount,
  deleteAccount,
  getAccountBalanceHistory,
  getAccountProviders,
  getAccountTypes,
  getAccounts,
  logAccountBalance,
  searchAccounts,
  updateAccount,
} from "../repository/accountsRepo";
import {
  createTRPCRouter,
  protectedProcedure,
  telegramProcedure,
} from "../trpc";

export const accountRouter = createTRPCRouter({
  listAccounts: telegramProcedure
    .input(
      z
        .object({
          type: z.string().uuid().optional(),
          query: z.string().optional(),
          provider: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      if (input?.query) {
        const accounts = await searchAccounts(input.query, ctx.prisma);
        const totalCount = await ctx.prisma.financialAccount.count();
        return {
          totalCount,
          accounts,
        };
      }
      const accounts = await getAccounts(
        input?.provider,
        input?.type,
        ctx.prisma,
      );
      const totalCount = await ctx.prisma.financialAccount.count();
      return {
        totalCount,
        accounts,
      };
    }),
  listAccountProviders: protectedProcedure.query(async ({ ctx }) => {
    return await getAccountProviders(ctx.prisma);
  }),
  listAccountTypes: protectedProcedure.query(async ({ ctx }) => {
    return await getAccountTypes(ctx.prisma);
  }),
  addAccount: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        balance: z.number().default(0),
        accountTypeId: z.string().uuid(),
        accountProviderId: z.string().uuid(),
        accountNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await addAccount(
        {
          name: input.name,
          balance: input.balance,
          accountType: { connect: { id: input.accountTypeId } },
          accountProvider: { connect: { id: input.accountProviderId } },
          accountNumber: input.accountNumber,
        },
        ctx.prisma,
      );
    }),
  deleteAccount: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return await deleteAccount(input.id, ctx.prisma);
    }),
  updateAccount: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        balance: z.number().optional(),
        accountTypeId: z.string().uuid().optional(),
        accountProviderId: z.string().uuid().optional(),
        accountNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await updateAccount(
        input.id,
        {
          name: input?.name,
          balance: input?.balance,
          accountType: { connect: { id: input?.accountTypeId } },
          accountProvider: { connect: { id: input?.accountProviderId } },
          accountNumber: input?.accountNumber,
        },
        ctx.prisma,
      );
    }),
  logAccountBalance: protectedProcedure.mutation(async ({ ctx }) => {
    const accounts = await getAccounts(null, null, ctx.prisma);
    const payload = accounts.map((account) => ({
      accountId: account.id,
      balance: account.balance,
      date: new Date(),
    }));
    return await logAccountBalance(payload, ctx.prisma);
  }),
  getAccountBalanceHistory: protectedProcedure
    .input(z.object({ rangeStart: z.date(), rangeEnd: z.date() }))
    .query(async ({ input, ctx }) => {
      return await getAccountBalanceHistory(
        input.rangeStart,
        input.rangeEnd,
        ctx.prisma,
      );
    }),
});
