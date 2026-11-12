-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `passwordHash` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `image` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Account_userId_idx`(`userId`),
    PRIMARY KEY (`provider`, `providerAccountId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordResetToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Design` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `tagline` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `story` TEXT NOT NULL,
    `details` TEXT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `imageKey` VARCHAR(191) NULL,
    `placementX` DOUBLE NOT NULL DEFAULT 0,
    `placementY` DOUBLE NOT NULL DEFAULT 0,
    `placementScale` DOUBLE NOT NULL DEFAULT 1,
    `status` ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `rejectionReason` TEXT NULL,
    `isNew` BOOLEAN NOT NULL DEFAULT false,
    `isBestSeller` BOOLEAN NOT NULL DEFAULT false,
    `creatorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `submittedAt` DATETIME(3) NULL,
    `approvedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Design_slug_key`(`slug`),
    INDEX `Design_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Design_creatorId_idx`(`creatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DesignImage` (
    `id` VARCHAR(191) NOT NULL,
    `designId` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `alt` VARCHAR(191) NOT NULL,
    `width` INTEGER NOT NULL DEFAULT 1200,
    `height` INTEGER NOT NULL DEFAULT 1500,
    `position` INTEGER NOT NULL DEFAULT 0,

    INDEX `DesignImage_designId_idx`(`designId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariant` (
    `id` VARCHAR(191) NOT NULL,
    `designId` VARCHAR(191) NOT NULL,
    `productType` ENUM('TEE', 'HOODIE', 'HAT', 'TOTE', 'MUG', 'BOTTLE') NOT NULL,
    `size` VARCHAR(191) NOT NULL,
    `colorName` VARCHAR(191) NOT NULL,
    `colorHex` VARCHAR(191) NOT NULL,
    `priceCents` INTEGER NOT NULL,
    `compareAtCents` INTEGER NULL,
    `sku` VARCHAR(191) NOT NULL,
    `fulfillmentVariantId` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ProductVariant_sku_key`(`sku`),
    INDEX `ProductVariant_designId_idx`(`designId`),
    UNIQUE INDEX `ProductVariant_designId_productType_size_colorName_key`(`designId`, `productType`, `size`, `colorName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `marketingOptIn` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING_PAYMENT', 'PAID', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING_PAYMENT',
    `shippingMethod` VARCHAR(191) NOT NULL,
    `subtotalCents` INTEGER NOT NULL,
    `shippingCents` INTEGER NOT NULL,
    `taxCents` INTEGER NOT NULL,
    `totalCents` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `shipFirstName` VARCHAR(191) NOT NULL,
    `shipLastName` VARCHAR(191) NOT NULL,
    `shipLine1` VARCHAR(191) NOT NULL,
    `shipLine2` VARCHAR(191) NULL,
    `shipCity` VARCHAR(191) NOT NULL,
    `shipRegion` VARCHAR(191) NOT NULL,
    `shipPostalCode` VARCHAR(191) NOT NULL,
    `shipCountry` VARCHAR(191) NOT NULL,
    `isGift` BOOLEAN NOT NULL DEFAULT false,
    `paymentProvider` VARCHAR(191) NOT NULL DEFAULT 'mock',
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'requires_payment',
    `paymentReference` VARCHAR(191) NULL,
    `fulfillmentProvider` VARCHAR(191) NOT NULL DEFAULT 'mock',
    `fulfillmentId` VARCHAR(191) NULL,
    `fulfillmentStatus` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_number_key`(`number`),
    INDEX `Order_userId_idx`(`userId`),
    INDEX `Order_email_idx`(`email`),
    INDEX `Order_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPriceCents` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `productType` ENUM('TEE', 'HOODIE', 'HAT', 'TOTE', 'MUG', 'BOTTLE') NOT NULL,
    `size` VARCHAR(191) NOT NULL,
    `colorName` VARCHAR(191) NOT NULL,
    `colorHex` VARCHAR(191) NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `designerName` VARCHAR(191) NOT NULL,

    INDEX `OrderItem_orderId_idx`(`orderId`),
    INDEX `OrderItem_variantId_idx`(`variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GiftDetails` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `recipientFirstName` VARCHAR(191) NOT NULL,
    `recipientLastName` VARCHAR(191) NOT NULL,
    `recipientLine1` VARCHAR(191) NOT NULL,
    `recipientLine2` VARCHAR(191) NULL,
    `recipientCity` VARCHAR(191) NOT NULL,
    `recipientRegion` VARCHAR(191) NOT NULL,
    `recipientPostalCode` VARCHAR(191) NOT NULL,
    `recipientCountry` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `hidePrices` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `GiftDetails_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Design` ADD CONSTRAINT `Design_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DesignImage` ADD CONSTRAINT `DesignImage_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_designId_fkey` FOREIGN KEY (`designId`) REFERENCES `Design`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GiftDetails` ADD CONSTRAINT `GiftDetails_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

