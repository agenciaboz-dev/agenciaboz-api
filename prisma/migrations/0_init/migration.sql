-- CreateTable
CREATE TABLE `adms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(55) NULL,
    `email` VARCHAR(55) NULL,
    `password` VARCHAR(55) NULL,
    `name` VARCHAR(55) NOT NULL,

    UNIQUE INDEX `adms_username_key`(`username`),
    UNIQUE INDEX `adms_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contracts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit` VARCHAR(55) NOT NULL,
    `date` DATE NOT NULL,
    `pessoa` VARCHAR(8) NOT NULL,
    `supplier` VARCHAR(55) NOT NULL,
    `name` VARCHAR(55) NOT NULL,
    `email` VARCHAR(55) NOT NULL,
    `phone` VARCHAR(55) NOT NULL,
    `address` VARCHAR(55) NOT NULL,
    `cep` VARCHAR(55) NOT NULL,
    `cnpj` VARCHAR(55) NULL,
    `company` VARCHAR(55) NULL,
    `category` VARCHAR(55) NULL,
    `cpf` VARCHAR(55) NULL,
    `rg` VARCHAR(55) NULL,
    `seller` INTEGER NOT NULL,
    `seller_name` VARCHAR(55) NULL,

    UNIQUE INDEX `unit`(`unit`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(55) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(55) NULL,
    `email` VARCHAR(55) NULL,
    `password` VARCHAR(55) NULL,
    `name` VARCHAR(55) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `financial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(55) NOT NULL,
    `email` VARCHAR(512) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

