<?php
/**
 * Al-Sader Wal-Wared Security Utilities
 * Provides functions for JWT token handling, encryption, and other security features
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
function envSec($key, $default = null) {
    return isset($_ENV[$key]) ? $_ENV[$key] : (isset($_SERVER[$key]) ? $_SERVER[$key] : $default);
}

// JWT Secret key - CHANGE THIS IN PRODUCTION or use environment variable
define('JWT_SECRET', envSec('JWT_SECRET', 'REPLACE_WITH_A_SECURE_RANDOM_STRING_IN_PRODUCTION'));
define('JWT_ALGORITHM', 'HS256');
define('JWT_ISSUER', envSec('JWT_ISSUER', 'alsader-walwared-api'));
define('JWT_EXPIRY', 86400); // 24 hours in seconds

// Encryption settings
define('ENCRYPTION_METHOD', 'aes-256-cbc');
define('ENCRYPTION_KEY', envSec('ENCRYPTION_KEY', 'REPLACE_WITH_A_SECURE_RANDOM_KEY_IN_PRODUCTION'));

/**
 * Generate a secure JWT token
 * 
 * @param array $payload Data to include in the token
 * @return string JWT token
 */
function generateJWT($payload) {
    // Create token header
    $header = [
        'typ' => 'JWT',
        'alg' => JWT_ALGORITHM
    ];
    
    // Create token payload
    $payload = array_merge($payload, [
        'iss' => JWT_ISSUER,
        'iat' => time(),
        'exp' => time() + JWT_EXPIRY,
        'jti' => bin2hex(random_bytes(16)) // Unique token ID
    ]);
    
    // Encode header and payload
    $base64UrlHeader = base64UrlEncode(json_encode($header));
    $base64UrlPayload = base64UrlEncode(json_encode($payload));
    
    // Create signature
    $signature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);
    
    // Create JWT token
    return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
}

/**
 * Decode and validate a JWT token
 * 
 * @param string $token JWT token
 * @return object Decoded payload
 * @throws Exception If token is invalid
 */
function decodeJWT($token) {
    // Split token
    $tokenParts = explode('.', $token);
    if (count($tokenParts) !== 3) {
        throw new Exception('Invalid token format');
    }
    
    // Get header and payload
    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $tokenParts;
    
    // Verify signature
    $signature = base64UrlDecode($base64UrlSignature);
    $expectedSignature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, JWT_SECRET, true);
    
    if (!hash_equals($signature, $expectedSignature)) {
        throw new Exception('Invalid token signature');
    }
    
    // Decode payload
    $payload = json_decode(base64UrlDecode($base64UrlPayload));
    if (!$payload) {
        throw new Exception('Invalid token payload');
    }
    
    // Verify token expiry
    if (isset($payload->exp) && time() > $payload->exp) {
        throw new Exception('Token has expired');
    }
    
    // Verify token issuer
    if (isset($payload->iss) && $payload->iss !== JWT_ISSUER) {
        throw new Exception('Invalid token issuer');
    }
    
    return $payload;
}

/**
 * Encrypt data using AES-256-CBC
 * 
 * @param string $data Data to encrypt
 * @return string Encrypted data (base64 encoded)
 */
function encryptData($data) {
    // Generate a random initialization vector
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length(ENCRYPTION_METHOD));
    
    // Encrypt data
    $encrypted = openssl_encrypt($data, ENCRYPTION_METHOD, ENCRYPTION_KEY, 0, $iv);
    
    // Combine IV and encrypted data
    return base64_encode($iv . $encrypted);
}

/**
 * Decrypt data using AES-256-CBC
 * 
 * @param string $data Encrypted data (base64 encoded)
 * @return string|false Decrypted data or false on failure
 */
function decryptData($data) {
    // Decode base64
    $data = base64_decode($data);
    
    // Get IV size
    $ivSize = openssl_cipher_iv_length(ENCRYPTION_METHOD);
    
    // Extract IV and encrypted data
    $iv = substr($data, 0, $ivSize);
    $encrypted = substr($data, $ivSize);
    
    // Decrypt data
    return openssl_decrypt($encrypted, ENCRYPTION_METHOD, ENCRYPTION_KEY, 0, $iv);
}

/**
 * Generate a secure random string
 * 
 * @param int $length Length of the random string
 * @param string $chars Characters to use (default: alphanumeric)
 * @return string Random string
 */
function generateRandomString($length = 32, $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    $randomString = '';
    $max = strlen($chars) - 1;
    
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $chars[random_int(0, $max)];
    }
    
    return $randomString;
}

/**
 * Generate a secure password hash using bcrypt
 * 
 * @param string $password Password to hash
 * @return string Hashed password
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT, ['cost' => 12]);
}

/**
 * Verify a password against its hash
 * 
 * @param string $password Password to verify
 * @param string $hash Hash to verify against
 * @return bool True if password is valid
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Sanitize output to prevent XSS attacks
 * 
 * @param string $output Output to sanitize
 * @return string Sanitized output
 */
function sanitizeOutput($output) {
    if (is_array($output)) {
        foreach ($output as $key => $value) {
            $output[$key] = sanitizeOutput($value);
        }
        return $output;
    }
    
    return htmlspecialchars($output, ENT_QUOTES, 'UTF-8');
}

/**
 * Encode data for use in JWT
 * 
 * @param string $data Data to encode
 * @return string Base64Url encoded data
 */
function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Decode data from JWT
 * 
 * @param string $data Base64Url encoded data
 * @return string Decoded data
 */
function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

/**
 * Generate CSRF token
 * 
 * @return string CSRF token
 */
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token
 * 
 * @param string $token CSRF token to verify
 * @return bool True if token is valid
 */
function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Set secure HTTP headers
 */
function setSecureHeaders() {
    // Enable HTTP Strict Transport Security (HSTS)
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    
    // Enable XSS Protection
    header('X-XSS-Protection: 1; mode=block');
    
    // Disable MIME type sniffing
    header('X-Content-Type-Options: nosniff');
    
    // Set Content Security Policy
    header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'");
    
    // Set Referrer Policy
    header('Referrer-Policy: strict-origin-when-cross-origin');
    
    // Set Feature Policy
    header("Feature-Policy: camera 'none'; microphone 'none'; geolocation 'none'");
    
    // Prevent framing of the site
    header('X-Frame-Options: DENY');
}

/**
 * Verify IP address is not in blacklist
 * 
 * @param string $ipAddress IP address to check
 * @param array $blacklist Blacklisted IP addresses or ranges
 * @return bool True if IP is allowed
 */
function isIpAllowed($ipAddress, $blacklist = []) {
    if (empty($blacklist)) {
        return true;
    }
    
    foreach ($blacklist as $item) {
        if (strpos($item, '/') !== false) {
            // CIDR notation
            list($subnet, $mask) = explode('/', $item);
            if (isIpInRange($ipAddress, $subnet, $mask)) {
                return false;
            }
        } else {
            // Exact match
            if ($ipAddress === $item) {
                return false;
            }
        }
    }
    
    return true;
}

/**
 * Check if IP is in specified range
 * 
 * @param string $ip IP address to check
 * @param string $subnet Subnet
 * @param int $mask Subnet mask
 * @return bool True if IP is in range
 */
function isIpInRange($ip, $subnet, $mask) {
    $ip = ip2long($ip);
    $subnet = ip2long($subnet);
    $mask = ~((1 << (32 - $mask)) - 1);
    
    return ($ip & $mask) === ($subnet & $mask);
}

// Set secure headers by default
setSecureHeaders(); 