# Monetas

[![Lint, type-check and build](https://github.com/athulp01/monetas/actions/workflows/ci.yml/badge.svg)](https://github.com/athulp01/monetas/actions/workflows/ci.yml)
[![Migrate databases](https://github.com/athulp01/monetas/actions/workflows/migrateDb.yml/badge.svg)](https://github.com/athulp01/monetas/actions/workflows/migrateDb.yml)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fathulp01%2Fmonetas&env=DATABASE_URL&project-name=monetas&repository-name=monetas)

# Installation
## Environment variables
Certainly, here are expanded descriptions for each of the environment variables in Markdown format:

1. **DATABASE_URL:**
   This variable holds the pooled connection URL of the database. It is used to establish a connection to the database with connection pooling, ensuring efficient management of database connections for better performance and scalability.

2. **DIRECT_URL:**
   The direct connection URL of the database is stored in this variable. Unlike the pooled connection, this URL allows direct one-to-one connections to the database without connection pooling, which might be useful for specific use cases or scenarios.

3. **NEXT_PUBLIC_GMAIL_OAUTH_CLIENT_ID:**
   This environment variable contains the OAuth client ID required to authenticate and access the Gmail API. It's an essential component of integrating your application with Gmail services, enabling secure and authorized communication.

4. **GMAIL_OAUTH_CLIENT_SECRET:**
   The Gmail API OAuth client secret is stored here. This secret works in conjunction with the client ID to establish secure communication between your application and the Gmail API, ensuring proper authorization and data protection.

5. **NEXT_PUBLIC_GMAIL_OAUTH_REDIRECT_URL:**
   This variable holds the OAuth redirect URL for the Gmail API callback. After a user authorizes access to their Gmail account, the API will redirect back to this URL, allowing your application to handle the authorization result.

6. **PUB_SUB_TOPIC_NAME:**
   The Pub/Sub topic name is stored in this variable. Pub/Sub is a messaging service, and this topic name is crucial for publishing and subscribing to messages. It defines the channel through which messages are exchanged between components.

7. **TELEGRAM_API_KEY:**
   The API key for your Telegram bot is stored in this variable. This key is used to authenticate your application when interacting with the Telegram Bot API, enabling the bot to send and receive messages and perform various actions.

8. **TELEGRAM_SECRET_TOKEN:**
   This variable holds the secret token required for authenticating your application with the Telegram bot. The secret token ensures that only authorized entities can communicate with and control the bot.

9. **NEXT_PUBLIC_TELEGRAM_BOT_NAME:**
   The public name of your Telegram bot is stored here. This name is used to identify and address your bot when it interacts with users and other Telegram entities.

10. **BASE_URL:**
    The base URL of your application is stored in this variable. It forms the foundation for constructing complete URLs for different routes and endpoints within your application.

11. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:**
    This variable contains the Clerk's publishable key, which is used to securely integrate and communicate with Clerk, a platform for user authentication and identity management.

12. **CLERK_SECRET_KEY:**
    The Clerk's secret key is stored here. It is a confidential token used to authenticate and secure the integration between your application and the Clerk identity management platform.