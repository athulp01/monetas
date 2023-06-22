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
    const params = new URLSearchParams(ctx.telegramData);
    const hash = params.get("hash");
    params.delete("hash");
    params.sort();
    let dataCheckString = "";
    for (const [key, value] of params.entries()) {
      dataCheckString += `${key}=${value}\n`;
    }
    dataCheckString = dataCheckString.slice(0, -1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    const chatId: string = JSON.parse(
      params.get("user"),
    )?.id?.toString() as string;
    const secret_key = crypto
      .createHmac("sha256", "WebAppData")
      .update(process.env.TELEGRAM_API_KEY)
      .digest();
    const computedHash = crypto
      .createHmac("sha256", secret_key)
      .update(dataCheckString)
      .digest("hex");
    if (computedHash == hash) {
      console.log("Valid hash");
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
