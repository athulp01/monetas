-- CreateEnum
CREATE TYPE "INVESTMENT_TYPE" AS ENUM ('STOCK', 'MUTUAL_FUND');

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

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Investment_symbol_key" ON "Investment"("symbol");
