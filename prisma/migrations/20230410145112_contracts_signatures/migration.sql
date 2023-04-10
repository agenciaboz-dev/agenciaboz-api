-- DropIndex
DROP INDEX `contracts_seller_id_fkey` ON `contracts`;

-- DropIndex
DROP INDEX `logs_contract_id_fkey` ON `logs`;

-- DropIndex
DROP INDEX `logs_seller_id_fkey` ON `logs`;

-- AlterTable
ALTER TABLE `contracts` ADD COLUMN `signatures` VARCHAR(191) NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial` ADD CONSTRAINT `financial_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rdstation` ADD CONSTRAINT `rdstation_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
