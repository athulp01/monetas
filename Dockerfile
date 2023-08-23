## This Dockerfile.withMigrate creates a production image without running migrations and seeding the database. This in turn reduces image size to 350MB from 600MB
# Hitting a weird network error when using alpine images
FROM node:18-bullseye-slim AS base
RUN corepack enable && corepack prepare pnpm@8.4.0 --activate

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY apps/nextjs/package.json ./apps/nextjs/package.json
COPY apps/email-listener/package.json ./apps/email-listener/package.json
COPY packages/api/package.json ./packages/api/package.json
COPY packages/db/package.json  ./packages/db/package.json
COPY packages/importer/package.json ./packages/importer/package.json
COPY packages/parser/package.json ./packages/parser/package.json
COPY packages/config/eslint/package.json ./packages/config/eslint/package.json
COPY packages/config/tailwind/package.json ./packages/config/tailwind/package.json

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc ./
RUN pnpm i --frozen-lockfile;

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/nextjs/node_modules ./apps/nextjs/node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules

ENV PATH /app/node_modules/.bin:$PATH
COPY . .


# Set this to use turbo remote cache
ARG TURBO_TOKEN
ENV TURBO_TOKEN $TURBO_TOKEN
ARG TURBO_TEAM
ENV TURBO_TEAM $TURBO_TEAM

ENV SKIP_ENV_VALIDATION true
ARG NEXT_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY $NEXT_CLERK_PUBLISHABLE_KEY

RUN pnpm next --version
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV NODE_ENV production

COPY --from=builder /app/apps/nextjs/public ./apps/nextjs/public

COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/static ./apps/nextjs/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
WORKDIR /app/apps/nextjs
CMD ["node", "server.js"]