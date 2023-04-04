/*
  Warnings:

  - You are about to drop the column `contract` on the `financial` table. All the data in the column will be lost.
  - You are about to drop the `adms` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[contract_id]` on the table `financial` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contract_id` to the `financial` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `contracts_seller_id_fkey` ON `contracts`;

-- DropIndex
DROP INDEX `financial_contract_key` ON `financial`;

-- AlterTable
ALTER TABLE `financial` DROP COLUMN `contract`,
    ADD COLUMN `contract_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `adm` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `adms`;

-- CreateTable
CREATE TABLE `rdstation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `state` INTEGER NOT NULL DEFAULT 1,
    `contract_id` INTEGER NOT NULL,

    UNIQUE INDEX `rdstation_contract_id_key`(`contract_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `financial_contract_id_key` ON `financial`(`contract_id`);

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial` ADD CONSTRAINT `financial_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rdstation` ADD CONSTRAINT `rdstation_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
