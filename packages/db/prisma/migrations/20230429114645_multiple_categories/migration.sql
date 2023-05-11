/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Payee` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payee" DROP CONSTRAINT "Payee_categoryId_fkey";

-- AlterTable
ALTER TABLE "Payee" DROP COLUMN "categoryId";

-- CreateTable
CREATE TABLE "_CategoryToPayee" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToPayee_AB_unique" ON "_CategoryToPayee"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToPayee_B_index" ON "_CategoryToPayee"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToPayee" ADD CONSTRAINT "_CategoryToPayee_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPayee" ADD CONSTRAINT "_CategoryToPayee_B_fkey" FOREIGN KEY ("B") REFERENCES "Payee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
