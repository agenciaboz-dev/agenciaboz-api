/*
  Warnings:

  - The primary key for the `rdstation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `rdstation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `contracts_seller_id_fkey` ON `contracts`;

-- AlterTable
ALTER TABLE `rdstation` DROP PRIMARY KEY;

-- CreateIndex
CREATE UNIQUE INDEX `rdstation_id_key` ON `rdstation`(`id`);

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial` ADD CONSTRAINT `financial_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rdstation` ADD CONSTRAINT `rdstation_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
