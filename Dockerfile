# Hitting a weird network error when using alpine images
FROM node:18-bullseye AS base
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
ENV PATH /app/node_modules/.bin:$PATH
COPY . .

# Set this to use turbo remote cache
#ENV TURBO_TOKEN value
#ENV TURBO_TEAM value

RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/tsconfig.json ./packages/db
RUN cd packages/db && pnpm install && cd ../../

ENV NODE_ENV production
COPY --from=builder /app/scripts/docker-startup-script.sh ./
RUN chmod +x ./docker-startup-script.sh

COPY --from=builder /app/apps/nextjs/public ./apps/nextjs/public

COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/static ./apps/nextjs/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
CMD ["./docker-startup-script.sh"]