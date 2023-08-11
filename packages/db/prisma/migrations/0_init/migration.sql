-- CreateEnum
CREATE TYPE "TRANSACTION_TYPE" AS ENUM ('CREDIT', 'DEBIT', 'TRANSFER');

-- CreateEnum
CREATE TYPE "INVESTMENT_TYPE" AS ENUM ('STOCK', 'MUTUAL_FUND');

-- CreateTable
CREATE TABLE "FinancialAccount" (
    "balance" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "accountTypeId" UUID NOT NULL,
    "accountProviderId" UUID NOT NULL,
    "accountNumber" TEXT,
    "userId" TEXT NOT NULL DEFAULT (current_setting('app.user_id'::text)),

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
    "userId" TEXT NOT NULL DEFAULT (current_setting('app.user_id'::text)),

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
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
    "userId" TEXT NOT NULL DEFAULT (current_setting('app.user_id'::text)),

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
    "userId" TEXT NOT NULL DEFAULT (current_setting('app.user_id'::text)),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionTags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT (current_setting('app.user_id'::text)),

    CONSTRAINT "TransactionTags_pkey" PRIMARY KEY ("id")
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
    "userId" TEXT NOT NULL DEFAULT (current_setting('app.user_id'::text)),

    CONSTRAINT "UnverifiedTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "type" "INVESTMENT_TYPE" NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 0,
    "buyPrice" INTEGER NOT NULL DEFAULT 0,
    "buyDate" TIMESTAMP(3) NOT NULL,
    "currentPrice" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL DEFAULT (current_setting('app.user_id'::text)),

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayeeAlias" (
    "alias" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "payeeId" UUID NOT NULL,

    CONSTRAINT "PayeeAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountBalanceHistory" (
    "balance" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP NOT NULL,
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "userId" TEXT NOT NULL DEFAULT (current_setting('app.user_id'::text)),

    CONSTRAINT "AccountBalanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramDetails" (
    "id" UUID NOT NULL,
    "chatId" TEXT,
    "userId" TEXT NOT NULL DEFAULT (current_setting('app.user_id'::text)),

    CONSTRAINT "TelegramDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GmailOauthDetails" (
    "id" UUID NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "expiry" TEXT NOT NULL,
    "watchExpiry" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '7 days',
    "userId" TEXT NOT NULL DEFAULT (current_setting('app.user_id'::text)),

    CONSTRAINT "GmailOauthDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToPayee" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_TransactionToTransactionTags" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE INDEX "FinancialAccount_name_idx" ON "FinancialAccount"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAccount_userId_name_key" ON "FinancialAccount"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAccountProvider_name_key" ON "FinancialAccountProvider"("name");

-- CreateIndex
CREATE INDEX "FinancialAccountProvider_name_idx" ON "FinancialAccountProvider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAccountType_name_key" ON "FinancialAccountType"("name");

-- CreateIndex
CREATE INDEX "FinancialAccountType_name_idx" ON "FinancialAccountType"("name");

-- CreateIndex
CREATE INDEX "Budget_monthAndYear_categoryId_idx" ON "Budget"("monthAndYear", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_monthAndYear_categoryId_userId_key" ON "Budget"("monthAndYear", "categoryId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Payee_name_userId_key" ON "Payee"("name", "userId");

-- CreateIndex
CREATE INDEX "Transaction_timeCreated_idx" ON "Transaction"("timeCreated");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionTags_name_key" ON "TransactionTags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionTags_name_userId_key" ON "TransactionTags"("name", "userId");

-- CreateIndex
CREATE INDEX "UnverifiedTransaction_timeCreated_idx" ON "UnverifiedTransaction"("timeCreated");

-- CreateIndex
CREATE UNIQUE INDEX "Investment_symbol_key" ON "Investment"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Investment_symbol_userId_key" ON "Investment"("symbol", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PayeeAlias_alias_key" ON "PayeeAlias"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramDetails_chatId_key" ON "TelegramDetails"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramDetails_userId_key" ON "TelegramDetails"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GmailOauthDetails_emailId_key" ON "GmailOauthDetails"("emailId");

-- CreateIndex
CREATE UNIQUE INDEX "GmailOauthDetails_userId_key" ON "GmailOauthDetails"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToPayee_AB_unique" ON "_CategoryToPayee"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToPayee_B_index" ON "_CategoryToPayee"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TransactionToTransactionTags_AB_unique" ON "_TransactionToTransactionTags"("A", "B");

-- CreateIndex
CREATE INDEX "_TransactionToTransactionTags_B_index" ON "_TransactionToTransactionTags"("B");

-- AddForeignKey
ALTER TABLE "FinancialAccount" ADD CONSTRAINT "FinancialAccount_accountProviderId_fkey" FOREIGN KEY ("accountProviderId") REFERENCES "FinancialAccountProvider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FinancialAccount" ADD CONSTRAINT "FinancialAccount_accountTypeId_fkey" FOREIGN KEY ("accountTypeId") REFERENCES "FinancialAccountType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

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

-- AddForeignKey
ALTER TABLE "AccountBalanceHistory" ADD CONSTRAINT "AccountBalanceHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinancialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPayee" ADD CONSTRAINT "_CategoryToPayee_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPayee" ADD CONSTRAINT "_CategoryToPayee_B_fkey" FOREIGN KEY ("B") REFERENCES "Payee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionToTransactionTags" ADD CONSTRAINT "_TransactionToTransactionTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionToTransactionTags" ADD CONSTRAINT "_TransactionToTransactionTags_B_fkey" FOREIGN KEY ("B") REFERENCES "TransactionTags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AccountBalanceHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AccountBalanceHistory" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "AccountBalanceHistory" USING ("userId" = current_setting('app.user_id', TRUE)::text);
CREATE POLICY bypass_rls_policy ON "AccountBalanceHistory" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "Budget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Budget" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Budget" USING ("userId" = current_setting('app.user_id', TRUE)::text);
CREATE POLICY bypass_rls_policy ON "Budget" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "FinancialAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FinancialAccount" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "FinancialAccount" USING ("userId" = current_setting('app.user_id', TRUE)::text);
CREATE POLICY bypass_rls_policy ON "FinancialAccount" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "GmailOauthDetails" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GmailOauthDetails" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "GmailOauthDetails" USING ("userId" = current_setting('app.user_id', TRUE)::text);
CREATE POLICY bypass_rls_policy ON "GmailOauthDetails" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "Investment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Investment" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Investment" USING ("userId" = current_setting('app.user_id', TRUE)::text);
CREATE POLICY bypass_rls_policy ON "Investment" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "Payee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payee" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Payee" USING ("userId" = current_setting('app.user_id', TRUE)::text);
CREATE POLICY bypass_rls_policy ON "Payee" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Transaction" USING ("userId" = current_setting('app.user_id', TRUE)::text);
CREATE POLICY bypass_rls_policy ON "Transaction" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "TelegramDetails" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TelegramDetails" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "TelegramDetails" USING ("userId" = current_setting('app.user_id', TRUE)::text);
CREATE POLICY bypass_rls_policy ON "TelegramDetails" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

ALTER TABLE "TransactionTags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TransactionTags" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "TransactionTags" USING ("userId" = current_setting('app.user_id', TRUE)::text);
CREATE POLICY bypass_rls_policy ON "TransactionTags" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');






