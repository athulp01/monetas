
import { z } from "zod";


import { INVESTMENT_TYPE } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { addInvestment, deleteInvestment, getInvestments, getQuote, updateInvestment } from "../repository/investment";

export const investmentRouter = createTRPCRouter({
  getQuote: publicProcedure
    .input(
      z.object({
        symbol: z.string(),
        type: z.nativeEnum(INVESTMENT_TYPE),
      })
    )
    .query(async ({ input }) => {
      const quote = await getQuote(
        input.symbol + (input.type === INVESTMENT_TYPE.STOCK ? ".NS" : ".BO")
      );
      if (quote == null) {
        throw new Error("Invalid symbol");
      }
      return quote;
    }),
  listInvestments: publicProcedure.query(async ({ ctx }) => {
    const investments = await getInvestments(ctx.prisma);
    const totalCount = await ctx.prisma.investment.count();
    return {
      totalCount,
      investments,
    };
  }),
  addInvestment: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        name: z.string(),
        type: z.nativeEnum(INVESTMENT_TYPE),
        units: z.number(),
        buyPrice: z.number(),
        buyDate: z.date(),
        currentPrice: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return addInvestment(
        {
          symbol: input.symbol,
          name: input.name,
          type: input.type,
          units: input.units,
          buyPrice: input.buyPrice,
          buyDate: input.buyDate,
          currentPrice: input.currentPrice,
        },
        ctx.prisma
      );
    }),
  deleteInvestment: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return deleteInvestment(input.id, ctx.prisma);
    }),
  updateInvestment: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        symbol: z.string().optional(),
        name: z.string().optional(),
        type: z.nativeEnum(INVESTMENT_TYPE).optional(),
        units: z.number().optional(),
        buyPrice: z.number().optional(),
        buyDate: z.date().optional(),
        currentPrice: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return updateInvestment(
        input.id,
        {
          symbol: input.symbol,
          name: input.name,
          type: input.type,
          units: input.units,
          buyPrice: input.buyPrice,
          buyDate: input.buyDate,
          currentPrice: input.currentPrice,
        },
        ctx.prisma
      );
    }),
});
