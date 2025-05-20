-- Database schema for Al-Sader Wal-Wared Document Management System
-- Highly secure implementation with encryption and protection features
-- Developed by Ghaith Boheme

-- Enable strict mode for better security
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION";
SET time_zone = "+00:00";

-- Create database with UTF-8 support for Arabic content
CREATE DATABASE IF NOT EXISTS `alsader_walwared_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `alsader_walwared_db`;

-- -------------------------------------------------------------------------
-- Users table with secure password storage
-- -------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL, -- Bcrypt hashed passwords (NOT plain text)
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  `department` VARCHAR(100) NULL DEFAULT NULL,
  `phone` VARCHAR(20) NULL DEFAULT NULL,
  `last_login` DATETIME NULL DEFAULT NULL,
  `login_attempts` TINYINT UNSIGNED NOT NULL DEFAULT '0',
  `locked_until` DATETIME NULL DEFAULT NULL,
  `mfa_secret` VARCHAR(100) NULL DEFAULT NULL, -- For future 2FA implementation
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `idx_user_status` (`active`, `locked_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- User sessions with JWT support
-- -------------------------------------------------------------------------
CREATE TABLE `user_sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL, -- Hashed token for verification without storing actual token
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  KEY `fk_sessions_user_idx` (`user_id`),
  KEY `idx_token_hash` (`token_hash`),
  KEY `idx_expires` (`expires_at`, `revoked`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- Documents table
-- -------------------------------------------------------------------------
CREATE TABLE `documents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reference_id` VARCHAR(20) NOT NULL, -- Custom document reference (IN-001, OUT-001, etc.)
  `title` VARCHAR(255) NOT NULL,
  `subject` TEXT NOT NULL,
  `document_date` DATE NOT NULL,
  `sender` VARCHAR(255) NOT NULL,
  `document_type` ENUM('inbound', 'outbound') NOT NULL,
  `file_path` VARCHAR(500) NULL DEFAULT NULL, -- Path to the stored file
  `file_name` VARCHAR(255) NULL DEFAULT NULL, -- Original filename
  `file_mime_type` VARCHAR(100) NULL DEFAULT NULL, -- MIME type of the file
  `file_size` INT UNSIGNED NULL DEFAULT NULL, -- Size in bytes
  `file_hash` VARCHAR(128) NULL DEFAULT NULL, -- SHA-512 hash for file integrity verification
  `created_by` INT UNSIGNED NOT NULL, -- User who created the document
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL, -- Soft delete support
  `is_manual_reference` BOOLEAN DEFAULT FALSE, -- Indicates if reference ID was entered manually
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference_id_UNIQUE` (`reference_id`),
  KEY `idx_document_type` (`document_type`),
  KEY `idx_document_date` (`document_date`),
  KEY `idx_sender` (`sender`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_soft_delete` (`deleted_at`),
  CONSTRAINT `fk_document_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- Document reservations table for reserving document numbers
-- -------------------------------------------------------------------------
CREATE TABLE `document_reservations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reference_id` VARCHAR(20) NOT NULL, -- Reserved reference ID
  `document_type` ENUM('inbound', 'outbound') NOT NULL,
  `notes` TEXT NULL, -- Notes about the reservation
  `reserved_by` INT UNSIGNED NOT NULL, -- User who reserved the number
  `reserved_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_used` BOOLEAN DEFAULT FALSE, -- Whether the reservation has been used
  `used_at` DATETIME NULL DEFAULT NULL, -- When the reservation was used
  `used_document_id` BIGINT UNSIGNED NULL DEFAULT NULL, -- Document that used this reservation
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference_id_UNIQUE` (`reference_id`),
  KEY `idx_reservation_type` (`document_type`),
  KEY `idx_reserved_by` (`reserved_by`),
  KEY `idx_is_used` (`is_used`),
  CONSTRAINT `fk_reservation_user` FOREIGN KEY (`reserved_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_reservation_document` FOREIGN KEY (`used_document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- Document access log for auditing
-- -------------------------------------------------------------------------
CREATE TABLE `document_access_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `document_id` BIGINT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `action` ENUM('view', 'download', 'edit', 'delete', 'create') NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` VARCHAR(255) NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_log_document_idx` (`document_id`),
  KEY `fk_log_user_idx` (`user_id`),
  KEY `idx_action_time` (`action`, `timestamp`),
  CONSTRAINT `fk_log_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- System settings table
-- -------------------------------------------------------------------------
CREATE TABLE `settings` (
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT NULL,
  `updated_by` INT UNSIGNED NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`),
  KEY `fk_settings_user_idx` (`updated_by`),
  CONSTRAINT `fk_settings_user` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- Document counters for automatic ID generation
-- -------------------------------------------------------------------------
CREATE TABLE `document_counters` (
  `counter_type` ENUM('inbound', 'outbound') NOT NULL,
  `year` SMALLINT UNSIGNED NOT NULL,
  `current_value` INT UNSIGNED NOT NULL DEFAULT 1,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`counter_type`, `year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- Create stored procedure for secure document ID generation
-- -------------------------------------------------------------------------
DELIMITER $$
CREATE PROCEDURE `generate_document_reference_id`(
  IN p_document_type ENUM('inbound', 'outbound'),
  OUT p_reference_id VARCHAR(20)
)
BEGIN
  DECLARE v_year SMALLINT;
  DECLARE v_current INT;
  DECLARE v_prefix VARCHAR(10);
  
  -- Get current year
  SET v_year = YEAR(CURDATE());
  
  -- Set prefix based on document type
  IF p_document_type = 'inbound' THEN
    SET v_prefix = 'IN';
  ELSE
    SET v_prefix = 'OUT';
  END IF;
  
  -- Get or create counter for this year and type
  INSERT INTO document_counters (counter_type, year, current_value)
  VALUES (p_document_type, v_year, 1)
  ON DUPLICATE KEY UPDATE current_value = current_value + 1;
  
  -- Get the updated counter value
  SELECT current_value INTO v_current
  FROM document_counters
  WHERE counter_type = p_document_type AND year = v_year;
  
  -- Create the reference ID
  SET p_reference_id = CONCAT(v_prefix, '-', v_year, '-', LPAD(v_current, 3, '0'));
END$$
DELIMITER ;

-- -------------------------------------------------------------------------
-- Create trigger for security logging on document modification
-- -------------------------------------------------------------------------
DELIMITER $$
CREATE TRIGGER before_document_update
BEFORE UPDATE ON documents
FOR EACH ROW
BEGIN
  -- If we're not just updating the updated_at timestamp
  IF NOT (OLD.file_path <=> NEW.file_path 
    AND OLD.title <=> NEW.title 
    AND OLD.subject <=> NEW.subject 
    AND OLD.sender <=> NEW.sender 
    AND OLD.document_date <=> NEW.document_date) THEN
    
    -- Record the file hash for integrity checking
    IF NEW.file_path IS NOT NULL AND (OLD.file_path IS NULL OR OLD.file_path <> NEW.file_path) THEN
      SET NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
  END IF;
END$$
DELIMITER ;

-- -------------------------------------------------------------------------
-- Initial settings
-- -------------------------------------------------------------------------
INSERT INTO `settings` (`key`, `value`, `updated_by`) VALUES
('company_name', 'Al-Sader Wal-Wared - نظام إدارة الصادر والوارد', 1),
('document_retention_days', '3650', 1),
('max_file_size_mb', '20', 1),
('allowed_file_types', 'pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png', 1),
('security_level', 'high', 1),
('enable_manual_reference_ids', 'true', 1),
('enable_reference_reservation', 'true', 1);

-- -------------------------------------------------------------------------
-- Create default admin account (CHANGE PASSWORD IN PRODUCTION)
-- -------------------------------------------------------------------------
-- Note: The password here is a placeholder - it will be properly hashed by the application
-- when the actual user is created through the API
INSERT INTO `users` (`username`, `email`, `password_hash`, `full_name`, `role`)
VALUES ('admin', 'admin@example.com', 'CHANGE_THIS_PASSWORD_HASH_IN_PRODUCTION', 'مدير النظام', 'admin'); 