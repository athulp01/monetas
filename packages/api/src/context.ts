import {
  getAuth,
  type SignedInAuthObject,
  type SignedOutAuthObject,
} from "@clerk/nextjs/server";
import { type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
type AuthContextProps = {
  auth: SignedInAuthObject | SignedOutAuthObject;
};

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
// eslint-disable-next-line @typescript-eslint/require-await
export const createContextInner = async ({ auth }: AuthContextProps) => {
  return {
    auth,
    prisma: null,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: CreateNextContextOptions) => {
  const telegramData = opts.req.headers["x-telegram-data"] as string;
  const innerContext = await createContextInner({ auth: getAuth(opts.req) });
  return {
    ...innerContext,
    telegramData,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
