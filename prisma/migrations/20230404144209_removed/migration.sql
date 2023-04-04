/*
  Warnings:

  - You are about to drop the column `seller` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `seller_name` on the `contracts` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `financial` table. The data in that column could be lost. The data in that column will be cast from `VarChar(512)` to `VarChar(191)`.
  - Added the required column `seller_id` to the `contracts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `adms` MODIFY `username` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL,
    MODIFY `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `contracts` DROP COLUMN `seller`,
    DROP COLUMN `seller_name`,
    ADD COLUMN `seller_id` INTEGER NOT NULL,
    MODIFY `unit` VARCHAR(191) NOT NULL,
    MODIFY `pessoa` VARCHAR(191) NOT NULL,
    MODIFY `supplier` VARCHAR(191) NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `phone` VARCHAR(191) NOT NULL,
    MODIFY `address` VARCHAR(191) NOT NULL,
    MODIFY `cep` VARCHAR(191) NOT NULL,
    MODIFY `cnpj` VARCHAR(191) NULL,
    MODIFY `company` VARCHAR(191) NULL,
    MODIFY `category` VARCHAR(191) NULL,
    MODIFY `cpf` VARCHAR(191) NULL,
    MODIFY `rg` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `emails` MODIFY `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `financial` MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `phone` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `username` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL,
    MODIFY `name` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
