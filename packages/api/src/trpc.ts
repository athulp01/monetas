/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */

import crypto from "crypto";
import * as process from "process";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { bypassRLS, forUser, prisma, type PrismaClient } from "@monetas/db";

import { type Context } from "./context";
import { getTelegramIntegrationByChatId } from "./repository/telegram";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  const prismaWithRls = prisma.$extends(forUser(ctx.auth?.userId));
  return next({
    ctx: {
      auth: ctx.auth,
      prisma: prismaWithRls as PrismaClient,
    },
  });
});

const isTelegramDataValid = t.middleware(async ({ next, ctx }) => {
  console.log("isTelegramDataValid");
  if (ctx.telegramData) {
    console.log(ctx.telegramData);
    const params = new URLSearchParams(ctx.telegramData);
    const hash = params.get("hash");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const chatId = JSON.parse(params.get("user"))?.id as string;
    console.log(hash, chatId);
    const secret_key = crypto
      .createHmac("sha256", "WebAppData")
      .update(process.env.TELGRAM_API_KEY)
      .digest();
    if (
      crypto
        .createHmac("sha256", secret_key)
        .update(ctx.telegramData)
        .digest("hex") == hash
    ) {
      console.log("Valid");
      const prismaWithoutRls = prisma.$extends(bypassRLS()) as PrismaClient;
      const telegramIntegration = await getTelegramIntegrationByChatId(
        chatId,
        prismaWithoutRls,
      );
      if (telegramIntegration) {
        const prismaWithRls = prisma.$extends(
          forUser(telegramIntegration.userId),
        ) as PrismaClient;
        return next({
          ctx: {
            auth: ctx.auth,
            prisma: prismaWithRls,
          },
        });
      }
    }
  }
  if (ctx?.auth?.userId) {
    const prismaWithRls = prisma.$extends(forUser(ctx.auth?.userId));
    return next({
      ctx: {
        auth: ctx.auth,
        prisma: prismaWithRls,
      },
    });
  }
  throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
});

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

export const telegramProcedure = t.procedure.use(isTelegramDataValid);
