import { z } from "zod";

import {
  getNetExpensePerCategory,
  getNetExpensePerDay,
  getNetExpensePerMonth,
  getNetExpensePerPayee,
  getNetWorth,
  getTotalExpensesForTheMonth,
  getTotalIncomeForTheMonth,
} from "../repository/reportsRepo";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const reportsRouter = createTRPCRouter({
  getTotalExpensesForMonth: protectedProcedure
    .input(z.object({ month: z.date() }))
    .query(async ({ input, ctx }) => {
      const response = await getTotalExpensesForTheMonth(
        input.month,
        ctx.prisma,
      );
      return { totalExpenses: response?._sum?.amount || 0, month: input.month };
    }),
  getTotalIncomeForMonth: protectedProcedure
    .input(z.object({ month: z.date() }))
    .query(async ({ input, ctx }) => {
      const response = await getTotalIncomeForTheMonth(input.month, ctx.prisma);
      return { totalIncome: response?._sum?.amount || 0, month: input.month };
    }),
  getNetWorth: protectedProcedure.query(async ({ ctx }) => {
    const response = await getNetWorth(ctx.prisma);
    return { netWorth: response._sum.balance };
  }),
  getNetExpensePerDay: protectedProcedure
    .input(
      z.object({
        rangeStart: z.date(),
        rangeEnd: z.date(),
        precision: z.enum(["day", "month"]),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.precision === "month") {
        return await getNetExpensePerMonth(
          input.rangeStart,
          input.rangeEnd,
          ctx.prisma,
        );
      }
      return await getNetExpensePerDay(
        input.rangeStart,
        input.rangeEnd,
        ctx.prisma,
      );
    }),
  getNetExpensePerCategory: protectedProcedure
    .input(
      z.object({
        rangeStart: z.date(),
        rangeEnd: z.date(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await getNetExpensePerCategory(
        input.rangeStart,
        input.rangeEnd,
        ctx.prisma,
      );
    }),
  getNetExpensePerPayee: protectedProcedure
    .input(
      z.object({
        rangeStart: z.date(),
        rangeEnd: z.date(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await getNetExpensePerPayee(
        input.rangeStart,
        input.rangeEnd,
        ctx.prisma,
      );
    }),
});
