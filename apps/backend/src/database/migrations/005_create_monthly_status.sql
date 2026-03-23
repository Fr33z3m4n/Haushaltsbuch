CREATE TABLE IF NOT EXISTS `monthly_statuses` (
  `id` VARCHAR(36) NOT NULL,
  `transactionId` VARCHAR(36) NOT NULL,
  `year` SMALLINT UNSIGNED NOT NULL,
  `month` TINYINT UNSIGNED NOT NULL,
  `isCompleted` TINYINT(1) NOT NULL DEFAULT 0,
  `completedAt` DATETIME NULL,
  `userId` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_monthly_statuses_tx_year_month` (`transactionId`, `year`, `month`),
  KEY `FK_monthly_statuses_userId` (`userId`),
  CONSTRAINT `FK_monthly_statuses_transactionId` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_monthly_statuses_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
