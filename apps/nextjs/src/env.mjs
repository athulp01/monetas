import { z } from "zod";

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */

const server = z.object({
  DATABASE_URL: z.string().url().min(1),
  DIRECT_URL: z.string().url().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  BASE_URL: z.string().url().optional(),
  TELEGRAM_API_KEY: z.string().optional(),
  TELEGRAM_SECRET_TOKEN: z.string().optional(),
  GMAIL_OAUTH_CLIENT_SECRET: z.string().optional(),
  PUB_SUB_TOPIC_NAME: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_GMAIL_OAUTH_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_GMAIL_OAUTH_REDIRECT_URL: z.string().optional(),
  NEXT_PUBLIC_TELEGRAM_BOT_NAME: z.string().optional(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 *
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL,
  DIRECT_URL: process.env.DIRECT_URL ?? process.env.POSTGRES_URL_NON_POOLING,
  NODE_ENV: process.env.NODE_ENV,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  TELEGRAM_API_KEY: process.env.TELEGRAM_API_KEY,
  TELEGRAM_SECRET_TOKEN: process.env.TELEGRAM_SECRET_TOKEN,
  BASE_URL: process.env.BASE_URL ?? (process.env.VERCEL_URL?"https://" + process.env.VERCEL_URL: undefined),
  NEXT_PUBLIC_GMAIL_OAUTH_CLIENT_ID: process.env.NEXT_PUBLIC_GMAIL_OAUTH_CLIENT_ID,
  GMAIL_OAUTH_CLIENT_SECRET: process.env.GMAIL_OAUTH_CLIENT_SECRET,
  NEXT_PUBLIC_GMAIL_OAUTH_REDIRECT_URL: process.env.NEXT_PUBLIC_GMAIL_OAUTH_REDIRECT_URL,
  PUB_SUB_TOPIC_NAME: process.env.PUB_SUB_TOPIC_NAME,
  NEXT_PUBLIC_TELEGRAM_BOT_NAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME,
};

const merged = server.merge(client);

/** @typedef {z.input<typeof merged>} MergedInput */
/** @typedef {z.infer<typeof merged>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

let env = /** @type {MergedOutput} */ (process.env);

if (!!process.env.SHOULD_VALIDATE_ENV) {
  const isServer = typeof window === "undefined";

  const parsed = /** @type {MergedSafeParseReturn} */ (
    isServer
      ? merged.safeParse(processEnv) // on server we can validate all env vars
      : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
  );

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          process.env.NODE_ENV === "production"
            ? "❌ Attempted to access a server-side environment variable on the client"
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`,
        );
      return target[/** @type {keyof typeof target} */ (prop)];
    },
  });
}

export { env };
