-- CreateEnum
CREATE TYPE "TRANSACTION_TYPE" AS ENUM ('CREDIT', 'DEBIT', 'TRANSFER');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "FinancialAccount" (
    "balance" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "accountTypeId" UUID NOT NULL,
    "accountProviderId" UUID NOT NULL,
    "accountNumber" TEXT,

    CONSTRAINT "FinancialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialAccountProvider" (
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "id" UUID NOT NULL,

    CONSTRAINT "FinancialAccountProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialAccountType" (
    "name" TEXT NOT NULL,
    "id" UUID NOT NULL,

    CONSTRAINT "FinancialAccountType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "monthAndYear" TIMESTAMP NOT NULL,
    "budgetedAmount" INTEGER NOT NULL DEFAULT 0,
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "spent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("monthAndYear","categoryId")
);

-- CreateTable
CREATE TABLE "Category" (
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "id" UUID NOT NULL,
    "type" "TRANSACTION_TYPE" NOT NULL DEFAULT 'CREDIT',

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payee" (
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "notes" TEXT,
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "Payee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "amount" INTEGER DEFAULT 0,
    "notes" TEXT,
    "timeCreated" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "TRANSACTION_TYPE" NOT NULL DEFAULT 'DEBIT',
    "id" UUID NOT NULL,
    "payeeId" UUID,
    "sourceAccountId" UUID NOT NULL,
    "transferredAccountId" UUID,
    "categoryId" UUID NOT NULL,
    "financialAccountId" UUID,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnverifiedTransaction" (
    "amount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "timeCreated" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "TRANSACTION_TYPE",
    "id" UUID NOT NULL,
    "payeeId" UUID,
    "accountId" UUID,
    "transferredAccountId" UUID,
    "categoryId" UUID,
    "payeeAlias" TEXT,

    CONSTRAINT "UnverifiedTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayeeAlias" (
    "alias" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "payeeId" UUID NOT NULL,

    CONSTRAINT "PayeeAlias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAccountProvider_name_key" ON "FinancialAccountProvider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAccountType_name_key" ON "FinancialAccountType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_id_key" ON "Budget"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Payee_name_key" ON "Payee"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PayeeAlias_alias_key" ON "PayeeAlias"("alias");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialAccount" ADD CONSTRAINT "FinancialAccount_accountProviderId_fkey" FOREIGN KEY ("accountProviderId") REFERENCES "FinancialAccountProvider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FinancialAccount" ADD CONSTRAINT "FinancialAccount_accountTypeId_fkey" FOREIGN KEY ("accountTypeId") REFERENCES "FinancialAccountType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Payee" ADD CONSTRAINT "Payee_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sourceAccountId_fkey" FOREIGN KEY ("sourceAccountId") REFERENCES "FinancialAccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_payeeId_fkey" FOREIGN KEY ("payeeId") REFERENCES "Payee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transferredAccountId_fkey" FOREIGN KEY ("transferredAccountId") REFERENCES "FinancialAccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnverifiedTransaction" ADD CONSTRAINT "UnverifiedTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinancialAccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UnverifiedTransaction" ADD CONSTRAINT "UnverifiedTransaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UnverifiedTransaction" ADD CONSTRAINT "UnverifiedTransaction_payeeId_fkey" FOREIGN KEY ("payeeId") REFERENCES "Payee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UnverifiedTransaction" ADD CONSTRAINT "UnverifiedTransaction_transferredAccountId_fkey" FOREIGN KEY ("transferredAccountId") REFERENCES "FinancialAccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PayeeAlias" ADD CONSTRAINT "PayeeAlias_payeeId_fkey" FOREIGN KEY ("payeeId") REFERENCES "Payee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

