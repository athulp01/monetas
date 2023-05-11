import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { addPayee, deletePayee, getPayees, updatePayee } from "../repository/payee";

export const payeeRouter = createTRPCRouter({
  listPayees: publicProcedure
    .input(z.object({ categoryId: z.string().uuid().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const payees = await getPayees(input?.categoryId, ctx.prisma);
      const totalCount = await ctx.prisma.payee.count();
      return {
        totalCount,
        payees,
      };
    }),
  addPayee: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        categoryIds: z.array(z.string().uuid()).optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return addPayee(
        {
          name: input.name,
          icon: input.icon,
          categories: { connect: input.categoryIds?.map((id) => ({ id })) },
        },
        ctx.prisma
      );
    }),
  updatePayee: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        categoryIds: z.array(z.string().uuid()).optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return updatePayee(
        input.id,
        {
          name: input.name,
          icon: input.icon,
          categories: input.categoryIds
            ? { set: input.categoryIds?.map((id) => ({ id })) }
            : undefined,
        },
        ctx.prisma
      );
    }),
  deletePayee: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await deletePayee(input.id, ctx.prisma);
    }),
});
