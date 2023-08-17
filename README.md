# Monetas

[![Lint, type-check and build](https://github.com/athulp01/monetas/actions/workflows/ci.yml/badge.svg)](https://github.com/athulp01/monetas/actions/workflows/ci.yml)
[![Migrate databases](https://github.com/athulp01/monetas/actions/workflows/migrateDb.yml/badge.svg)](https://github.com/athulp01/monetas/actions/workflows/migrateDb.yml)


# Installation
## Self Hosting
1. Edit docker-compose.yml to fill all missing env vars. Refer [here](#environment-variables) for more info.
2. Run `docker-compose up -d `
3. Navigate to http://localhost:3000

## Vercel
Vercel provides free hosting and postgres db with 500MB storage under their hobby plan.

1. Signup for [Vercel](https://vercel.com/home)
2. Create a free postgres database by following these [instructions](https://vercel.com/docs/storage/vercel-postgres/quickstart#create-a-postgres-database). 
3. Navigate to the created database. Copy the value of `POSTGRES_URL_NON_POOLING`, which is available under .env.local tab under quickstart section.
4. Run the below command from the repo root.
```bash
pnpm install
DIRECT_URL=<POSTGRES_URL_NON_POOLING> DATABASE_URL=$DIRECT_URL pnpm db:migrate
DIRECT_URL=<POSTGRES_URL_NON_POOLING> DATABASE_URL=$DIRECT_URL pnpm db:seed
```
5. Setup auth by following this [section](#auth-setup)
6. Setup integrations by following this [section](#integrations-setup)
7. Click the below button which will take you through the rest of process.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fathulp01%2Fmonetas&env=DATABASE_URL&project-name=monetas&repository-name=monetas&integration-ids=oac_7uYNbc9CdDAZmNqbt3LEkO3a)

## Other Cloud Provider
Monetas can be deployed to cloud like any other nextjs app. Refer the nextjs deployment instructions [here](https://nextjs.org/docs/pages/building-your-application/deploying#other-services).


# Auth setup

# Integrations Setup
## Telegram

## Gmail API

# Environment variables
Certainly, here are expanded descriptions for each of the environment variables in Markdown format:

## Required
1. **DATABASE_URL:**
   The URL of the postgres database. Its recommended to use a connection pooler like pgBouncer since the db connection limit can get exhausted quickly in a serverless environment.

2. **DIRECT_URL:**
   The direct connection URL of the database(without pooler). This is used for performing migrations and seeding. (DATABASE_URL and DIRECT_URL can be same)

3. **BASE_URL:**
   The base URL of your application
4. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:**
   This variable contains the Clerk's publishable key, which is used to securely integrate and communicate with Clerk, a platform for user authentication and identity management.

5. **CLERK_SECRET_KEY:**
   The Clerk's secret key is stored here. It is a confidential token used to authenticate and secure the integration between your application and the Clerk identity management platform.

## Optional

1. **NEXT_PUBLIC_GMAIL_OAUTH_CLIENT_ID:**
   Obtain OAuth2 credentials for accesing Google APIs by following this [link](https://developers.google.com/identity/protocols/oauth). Redirect URL should be set to `BASE_URL/api/gmail/oauth/callback`

2. **GMAIL_OAUTH_CLIENT_SECRET:**
   The OAuth2 client secret obtained.

3. **NEXT_PUBLIC_GMAIL_OAUTH_REDIRECT_URL:**
   Use the same redirect URL which was used while creating OAuth2 credentials.

4. **PUB_SUB_TOPIC_NAME:**
   The Google Pub/Sub topic name where the Gmail API will send the push notifications. Follow this [guide](https://developers.google.com/gmail/api/guides/push) to setup.

5. **TELEGRAM_API_KEY:**
   Telegram bot API token. Obtain it by following this [guide](https://core.telegram.org/bots/features#botfather)

6. **TELEGRAM_SECRET_TOKEN:**
   ```bash
   curl -X "POST" "https://api.telegram.org/xxx/setWebhook"
   -d '{"url": "BASE_URL/api/telegram/webhook", "secret_token": "REPLACE_WITH_RANDOM_ALPHA_NUMERIC"}'  
   -H 'Content-Type: application/json; charset=utf-8'
   ```
    Run the above curl command. Set the value secret_token parameter of the curl payload as the value of this env var.

7. **NEXT_PUBLIC_TELEGRAM_BOT_NAME:**
   The bot name which you have set while creating the telegram bot.


