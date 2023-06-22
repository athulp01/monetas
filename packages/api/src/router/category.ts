import { TRANSACTION_TYPE } from "@prisma/client";
import { z } from "zod";

import {
  addCategory,
  deleteCategory,
  getCategories,
} from "../repository/category";
import {
  createTRPCRouter,
  protectedProcedure,
  telegramProcedure,
} from "../trpc";

export const categoryRouter = createTRPCRouter({
  listCategories: telegramProcedure
    .input(
      z.object({ type: z.nativeEnum(TRANSACTION_TYPE).optional() }).optional(),
    )
    .query(async ({ input, ctx }) => {
      const categories =
        (await getCategories(
          input?.type ?? TRANSACTION_TYPE.DEBIT,
          ctx.prisma,
        )) ?? [];
      const totalCount = await ctx.prisma.category.count();
      return {
        totalCount,
        categories,
      };
    }),
  addCategory: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.nativeEnum(TRANSACTION_TYPE),
        icon: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await addCategory(
        {
          name: input.name,
          type: input.type,
          icon: input.icon,
        },
        ctx.prisma,
      );
    }),
  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return await deleteCategory(input.id, ctx.prisma);
    }),
});
