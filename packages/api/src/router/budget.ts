import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { addBudget, deleteBudget, getBudget, updateBudget } from "../repository/budget";
import moment from "moment";
import { getTotalExpenseForCategory } from "../repository/transactions";

export const budgetRouter = createTRPCRouter({
  listBudgets: protectedProcedure
    .input(z.object({ month: z.date() }))
    .query(async ({ input, ctx }) => {
      const budget = await getBudget(
        moment(input.month).startOf("month").toDate(),
        ctx.prisma
      );
      const totalCount = await ctx.prisma.budget.count();
      return {
        totalCount,
        budget,
      };
    }),
  addBudget: protectedProcedure
    .input(
      z.object({
        month: z.date(),
        categoryId: z.string().uuid(),
        amount: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const totalSpend =
        (
          await getTotalExpenseForCategory(
            input.categoryId,
            moment(input.month).startOf("month").toDate(),
            ctx.prisma
          )
        )?._sum?.amount || 0;
      const budget = await addBudget(
        {
          monthAndYear: moment(input.month).startOf("month").toDate(),
          category: { connect: { id: input.categoryId } },
          budgetedAmount: input.amount,
          spent: totalSpend,
        },
        ctx.prisma
      );
      return budget;
    }),
  deleteBudget: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await deleteBudget(input.id, ctx.prisma);
    }),
  updateBudget: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        amount: z.number().optional(),
        categoryId: z.string().uuid().optional(),
        month: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await updateBudget(
        input.id,
        {
          budgetedAmount: input.amount,
          category: { connect: { id: input.categoryId } },
          monthAndYear: moment(input.month).startOf("month").toDate(),
        },
        ctx.prisma
      );
    }),
});
