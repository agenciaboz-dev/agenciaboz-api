/*
  Warnings:

  - A unique constraint covering the columns `[contract]` on the table `financial` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contract` to the `financial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `financial` ADD COLUMN `contract` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `financial_contract_key` ON `financial`(`contract`);
