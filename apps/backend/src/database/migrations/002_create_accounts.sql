CREATE TABLE IF NOT EXISTS `accounts` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `type` ENUM('bank','paypal','credit_card','cash','other') NOT NULL DEFAULT 'bank',
  `description` TEXT NULL,
  `color` VARCHAR(7) NOT NULL DEFAULT '#6c757d',
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `userId` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_accounts_userId` (`userId`),
  CONSTRAINT `FK_accounts_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
