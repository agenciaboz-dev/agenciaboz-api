/*
  Warnings:

  - Added the required column `phone` to the `financial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `financial` ADD COLUMN `phone` VARCHAR(55) NOT NULL;
