<?php
/**
 * Database configuration file for Al-Sader Wal-Wared
 * This file contains secure database connection settings
 * Developed by Ghaith Boheme
 */

// Load environment variables from .env file if available
if (file_exists(__DIR__ . '/../.env')) {
    $envFile = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envFile as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Function to get environment variables with fallback
function env($key, $default = null) {
    return isset($_ENV[$key]) ? $_ENV[$key] : (isset($_SERVER[$key]) ? $_SERVER[$key] : $default);
}

// Database configuration with secure defaults
define('DB_HOST', env('DB_HOST', 'localhost'));
define('DB_NAME', env('DB_NAME', 'alsader_walwared_db'));
define('DB_USER', env('DB_USER', 'REPLACE_WITH_ACTUAL_USERNAME'));
define('DB_PASSWORD', env('DB_PASSWORD', 'REPLACE_WITH_ACTUAL_PASSWORD'));
define('DB_CHARSET', 'utf8mb4');
define('DB_PORT', env('DB_PORT', 3306));

// SSL/TLS configuration for secure connection
define('DB_SSL', env('DB_SSL', false));
define('DB_SSL_KEY', env('DB_SSL_KEY', null));
define('DB_SSL_CERT', env('DB_SSL_CERT', null));
define('DB_SSL_CA', env('DB_SSL_CA', null));
define('DB_SSL_VERIFY', env('DB_SSL_VERIFY', true));

/**
 * Get secure PDO database connection
 * 
 * @return PDO Database connection
 */
function getDbConnection() {
    try {
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET . " COLLATE utf8mb4_unicode_ci; SET time_zone = '+00:00';"
        ];

        // Add SSL options if enabled
        if (DB_SSL) {
            if (DB_SSL_KEY && DB_SSL_CERT && DB_SSL_CA) {
                $options[PDO::MYSQL_ATTR_SSL_KEY] = DB_SSL_KEY;
                $options[PDO::MYSQL_ATTR_SSL_CERT] = DB_SSL_CERT;
                $options[PDO::MYSQL_ATTR_SSL_CA] = DB_SSL_CA;
            }
            if (DB_SSL_VERIFY) {
                $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
            }
        }

        // Create PDO connection
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET . ";port=" . DB_PORT;
        $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, $options);
        
        // Set additional secure options
        $pdo->exec("SET SESSION sql_mode = 'STRICT_ALL_TABLES,NO_AUTO_CREATE_USER'");
        
        return $pdo;
    } catch (PDOException $e) {
        // Log error without revealing sensitive information
        error_log('Database connection error: ' . $e->getMessage());
        throw new Exception('Database connection failed. Please contact system administrator.');
    }
}

/**
 * Sanitize input to prevent SQL injection
 * 
 * @param string $input Input to sanitize
 * @return string Sanitized input
 */
function sanitizeInput($input) {
    if (is_array($input)) {
        foreach ($input as $key => $value) {
            $input[$key] = sanitizeInput($value);
        }
        return $input;
    }
    
    // Remove potentially harmful characters
    $input = trim($input);
    $input = stripslashes($input);
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    
    return $input;
} 