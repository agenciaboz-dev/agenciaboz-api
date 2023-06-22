-- DropIndex
DROP INDEX `contracts_seller_id_fkey` ON `contracts`;

-- DropIndex
DROP INDEX `images_user_id_fkey` ON `images`;

-- DropIndex
DROP INDEX `logs_contract_id_fkey` ON `logs`;

-- DropIndex
DROP INDEX `logs_seller_id_fkey` ON `logs`;

-- DropIndex
DROP INDEX `texts_user_id_fkey` ON `texts`;

-- AlterTable
ALTER TABLE `images` ADD COLUMN `size` VARCHAR(191) NOT NULL DEFAULT '1280x720';

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial` ADD CONSTRAINT `financial_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rdstation` ADD CONSTRAINT `rdstation_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `omie` ADD CONSTRAINT `omie_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `texts` ADD CONSTRAINT `texts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `images` ADD CONSTRAINT `images_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
