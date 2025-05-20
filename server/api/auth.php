<?php
/**
 * Al-Sader Wal-Wared Authentication API Endpoints
 * Includes secure login, token validation, and password reset
 * Developed by Ghaith Boheme
 */

header('Content-Type: application/json; charset=utf-8');
session_start();

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/security.php';

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get database connection
$db = getDbConnection();

// Get request data
$requestData = json_decode(file_get_contents('php://input'), true);
$requestMethod = $_SERVER['REQUEST_METHOD'];
$endpoint = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($endpoint) {
        case 'login':
            if ($requestMethod !== 'POST') {
                httpResponse(405, ['error' => 'Method not allowed']);
            }
            handleLogin($requestData, $db);
            break;
            
        case 'logout':
            if ($requestMethod !== 'POST') {
                httpResponse(405, ['error' => 'Method not allowed']);
            }
            handleLogout($db);
            break;
            
        case 'verify':
            if ($requestMethod !== 'GET') {
                httpResponse(405, ['error' => 'Method not allowed']);
            }
            verifyToken($db);
            break;
            
        case 'reset-password':
            if ($requestMethod !== 'POST') {
                httpResponse(405, ['error' => 'Method not allowed']);
            }
            handlePasswordReset($requestData, $db);
            break;
            
        case 'change-password':
            if ($requestMethod !== 'POST') {
                httpResponse(405, ['error' => 'Method not allowed']);
            }
            handlePasswordChange($requestData, $db);
            break;
            
        default:
            httpResponse(404, ['error' => 'Endpoint not found']);
    }
} catch (Exception $e) {
    // Log the error safely without exposing details
    error_log('API Error: ' . $e->getMessage());
    httpResponse(500, ['error' => 'Server error. Please try again later.']);
}

/**
 * Handle login request
 * 
 * @param array $data Request data
 * @param PDO $db Database connection
 */
function handleLogin($data, $db) {
    // Validate input
    if (!isset($data['username']) || !isset($data['password'])) {
        httpResponse(400, ['error' => 'Username and password are required']);
    }
    
    $username = sanitizeInput($data['username']);
    $password = $data['password']; // Don't sanitize passwords
    
    // Check for brute force attacks - Rate limiting
    checkLoginAttempts($username, $db);
    
    // Get user from database
    $stmt = $db->prepare('SELECT id, username, email, full_name, password_hash, role, active, login_attempts, locked_until FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    // Verify credentials
    if (!$user || !password_verify($password, $user['password_hash'])) {
        // Increment login attempts
        incrementLoginAttempts($username, $db);
        
        // Generic error message to prevent username enumeration
        httpResponse(401, ['error' => 'Invalid credentials']);
    }
    
    // Check if account is active and not locked
    if (!$user['active']) {
        httpResponse(403, ['error' => 'Account is disabled. Please contact administrator.']);
    }
    
    if ($user['locked_until'] && new DateTime($user['locked_until']) > new DateTime()) {
        httpResponse(403, ['error' => 'Account is temporarily locked. Please try again later.']);
    }
    
    // Reset login attempts on successful login
    resetLoginAttempts($username, $db);
    
    // Generate secure JWT token
    $token = generateJWT([
        'userId' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role']
    ]);
    
    // Record session info
    $stmt = $db->prepare('INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)');
    $tokenHash = password_hash($token, PASSWORD_DEFAULT);
    $ipAddress = $_SERVER['REMOTE_ADDR'];
    $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
    $expiresAt = date('Y-m-d H:i:s', time() + (24 * 60 * 60)); // 24 hours from now
    $stmt->execute([$user['id'], $tokenHash, $ipAddress, $userAgent, $expiresAt]);
    
    // Update last login
    $stmt = $db->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
    $stmt->execute([$user['id']]);
    
    // Return user data and token (remove sensitive data)
    unset($user['password_hash']);
    unset($user['login_attempts']);
    unset($user['locked_until']);
    
    httpResponse(200, [
        'user' => $user,
        'token' => $token,
        'expires' => $expiresAt
    ]);
}

/**
 * Handle logout request
 * 
 * @param PDO $db Database connection
 */
function handleLogout($db) {
    // Get and validate JWT token
    $token = getBearerToken();
    if (!$token) {
        httpResponse(401, ['error' => 'Authentication required']);
    }
    
    try {
        // Decode token
        $payload = decodeJWT($token);
        
        // Revoke the token in the database
        $stmt = $db->prepare('UPDATE user_sessions SET revoked = TRUE WHERE user_id = ? AND revoked = FALSE');
        $stmt->execute([$payload->userId]);
        
        httpResponse(200, ['message' => 'Logout successful']);
    } catch (Exception $e) {
        // Token is invalid, but we can still return success
        httpResponse(200, ['message' => 'Logout successful']);
    }
}

/**
 * Verify if token is valid and get user info
 * 
 * @param PDO $db Database connection
 */
function verifyToken($db) {
    // Get and validate JWT token
    $token = getBearerToken();
    if (!$token) {
        httpResponse(401, ['error' => 'Authentication required']);
    }
    
    try {
        // Decode token
        $payload = decodeJWT($token);
        
        // Get user from database to ensure they still exist and are active
        $stmt = $db->prepare('SELECT id, username, email, full_name, role, active FROM users WHERE id = ? AND active = TRUE');
        $stmt->execute([$payload->userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            httpResponse(403, ['error' => 'User not found or inactive']);
        }
        
        // Check if token has been revoked
        $stmt = $db->prepare('
            SELECT COUNT(*) AS count FROM user_sessions 
            WHERE user_id = ? AND revoked = FALSE AND expires_at > NOW()
        ');
        $stmt->execute([$payload->userId]);
        $result = $stmt->fetch();
        
        if ($result['count'] === 0) {
            httpResponse(401, ['error' => 'Token has expired or been revoked']);
        }
        
        // Return user info
        httpResponse(200, ['user' => $user]);
    } catch (Exception $e) {
        httpResponse(401, ['error' => 'Invalid token']);
    }
}

/**
 * Handle password reset request (sends email with reset link)
 * 
 * @param array $data Request data
 * @param PDO $db Database connection
 */
function handlePasswordReset($data, $db) {
    // Validate input
    if (!isset($data['email'])) {
        httpResponse(400, ['error' => 'Email is required']);
    }
    
    $email = sanitizeInput($data['email']);
    
    // Check if email exists
    $stmt = $db->prepare('SELECT id, username, email FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    // Always return success even if email doesn't exist to prevent email enumeration
    if (!$user) {
        httpResponse(200, ['message' => 'If your email exists in our system, you will receive reset instructions shortly.']);
    }
    
    // Generate secure token
    $resetToken = bin2hex(random_bytes(32));
    $tokenHash = password_hash($resetToken, PASSWORD_DEFAULT);
    $expiresAt = date('Y-m-d H:i:s', time() + (1 * 60 * 60)); // 1 hour from now
    
    // Store token in database
    $stmt = $db->prepare('
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE token_hash = ?, expires_at = ?
    ');
    $stmt->execute([$user['id'], $tokenHash, $expiresAt, $tokenHash, $expiresAt]);
    
    // Send reset email (in a real system, you would integrate with an email service)
    $resetUrl = "https://your-site.com/reset-password?token=$resetToken&email=" . urlencode($email);
    
    // For development purposes, just return the URL
    httpResponse(200, [
        'message' => 'If your email exists in our system, you will receive reset instructions shortly.',
        'resetUrl' => $resetUrl, // Remove this in production!
    ]);
}

/**
 * Handle password change request
 * 
 * @param array $data Request data
 * @param PDO $db Database connection
 */
function handlePasswordChange($data, $db) {
    // If user is authenticated, change with current password
    $token = getBearerToken();
    
    if ($token) {
        changePasswordAuthenticated($data, $db, $token);
    } else if (isset($data['resetToken']) && isset($data['email'])) {
        // Change password with reset token
        changePasswordWithResetToken($data, $db);
    } else {
        httpResponse(401, ['error' => 'Authentication required']);
    }
}

/**
 * Change password for authenticated user
 * 
 * @param array $data Request data
 * @param PDO $db Database connection
 * @param string $token JWT token
 */
function changePasswordAuthenticated($data, $db, $token) {
    // Validate input
    if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
        httpResponse(400, ['error' => 'Current password and new password are required']);
    }
    
    // Decode token
    try {
        $payload = decodeJWT($token);
    } catch (Exception $e) {
        httpResponse(401, ['error' => 'Invalid token']);
    }
    
    // Get user from database
    $stmt = $db->prepare('SELECT id, password_hash FROM users WHERE id = ?');
    $stmt->execute([$payload->userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        httpResponse(404, ['error' => 'User not found']);
    }
    
    // Verify current password
    if (!password_verify($data['currentPassword'], $user['password_hash'])) {
        httpResponse(403, ['error' => 'Current password is incorrect']);
    }
    
    // Validate password strength
    validatePassword($data['newPassword']);
    
    // Update password
    $passwordHash = password_hash($data['newPassword'], PASSWORD_DEFAULT);
    $stmt = $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $stmt->execute([$passwordHash, $user['id']]);
    
    httpResponse(200, ['message' => 'Password changed successfully']);
}

/**
 * Change password using reset token
 * 
 * @param array $data Request data
 * @param PDO $db Database connection
 */
function changePasswordWithResetToken($data, $db) {
    // Validate input
    if (!isset($data['resetToken']) || !isset($data['email']) || !isset($data['newPassword'])) {
        httpResponse(400, ['error' => 'Reset token, email, and new password are required']);
    }
    
    $email = sanitizeInput($data['email']);
    $resetToken = $data['resetToken'];
    
    // Get user from database
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        httpResponse(404, ['error' => 'User not found']);
    }
    
    // Check if token exists and is valid
    $stmt = $db->prepare('
        SELECT token_hash FROM password_reset_tokens 
        WHERE user_id = ? AND expires_at > NOW() 
        ORDER BY expires_at DESC LIMIT 1
    ');
    $stmt->execute([$user['id']]);
    $token = $stmt->fetch();
    
    if (!$token || !password_verify($resetToken, $token['token_hash'])) {
        httpResponse(403, ['error' => 'Invalid or expired reset token']);
    }
    
    // Validate password strength
    validatePassword($data['newPassword']);
    
    // Update password
    $passwordHash = password_hash($data['newPassword'], PASSWORD_DEFAULT);
    $stmt = $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $stmt->execute([$passwordHash, $user['id']]);
    
    // Delete used token
    $stmt = $db->prepare('DELETE FROM password_reset_tokens WHERE user_id = ?');
    $stmt->execute([$user['id']]);
    
    httpResponse(200, ['message' => 'Password changed successfully']);
}

/**
 * Check and limit login attempts to prevent brute force attacks
 * 
 * @param string $username Username
 * @param PDO $db Database connection
 */
function checkLoginAttempts($username, $db) {
    $stmt = $db->prepare('SELECT login_attempts, locked_until FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    // If user exists and is locked, check if lock time has expired
    if ($user && $user['locked_until']) {
        $lockedUntil = new DateTime($user['locked_until']);
        $now = new DateTime();
        
        if ($lockedUntil > $now) {
            // Account is still locked
            $remainingMinutes = round(($lockedUntil->getTimestamp() - $now->getTimestamp()) / 60);
            httpResponse(403, [
                'error' => 'Too many failed login attempts. Account is temporarily locked.',
                'lockedUntil' => $user['locked_until'],
                'message' => "Please try again in $remainingMinutes minutes."
            ]);
        } else {
            // Lock has expired, reset attempts
            resetLoginAttempts($username, $db);
        }
    }
}

/**
 * Increment login attempts
 * 
 * @param string $username Username
 * @param PDO $db Database connection
 */
function incrementLoginAttempts($username, $db) {
    // Get current attempts
    $stmt = $db->prepare('SELECT login_attempts FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Use a random delay to prevent timing attacks for non-existent users
        usleep(rand(100000, 300000)); // 100-300ms
        return;
    }
    
    $attempts = $user['login_attempts'] + 1;
    
    // Update attempts
    if ($attempts >= 5) {
        // Lock account for increasing periods based on number of attempts
        $lockMinutes = min(pow(2, $attempts - 5), 60); // Exponential backoff, max 60 minutes
        $lockedUntil = date('Y-m-d H:i:s', time() + ($lockMinutes * 60));
        
        $stmt = $db->prepare('UPDATE users SET login_attempts = ?, locked_until = ? WHERE username = ?');
        $stmt->execute([$attempts, $lockedUntil, $username]);
    } else {
        // Just increment attempts
        $stmt = $db->prepare('UPDATE users SET login_attempts = ? WHERE username = ?');
        $stmt->execute([$attempts, $username]);
    }
}

/**
 * Reset login attempts on successful login
 * 
 * @param string $username Username
 * @param PDO $db Database connection
 */
function resetLoginAttempts($username, $db) {
    $stmt = $db->prepare('UPDATE users SET login_attempts = 0, locked_until = NULL WHERE username = ?');
    $stmt->execute([$username]);
}

/**
 * Validate password strength
 * 
 * @param string $password Password to validate
 */
function validatePassword($password) {
    // Check length (minimum 8 characters)
    if (strlen($password) < 8) {
        httpResponse(400, ['error' => 'Password must be at least 8 characters long']);
    }
    
    // Check for at least one uppercase letter
    if (!preg_match('/[A-Z]/', $password)) {
        httpResponse(400, ['error' => 'Password must contain at least one uppercase letter']);
    }
    
    // Check for at least one lowercase letter
    if (!preg_match('/[a-z]/', $password)) {
        httpResponse(400, ['error' => 'Password must contain at least one lowercase letter']);
    }
    
    // Check for at least one number
    if (!preg_match('/[0-9]/', $password)) {
        httpResponse(400, ['error' => 'Password must contain at least one number']);
    }
    
    // Check for at least one special character
    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        httpResponse(400, ['error' => 'Password must contain at least one special character']);
    }
}

/**
 * Send HTTP response in JSON format
 * 
 * @param int $statusCode HTTP status code
 * @param array $data Response data
 */
function httpResponse($statusCode, $data) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/**
 * Get bearer token from Authorization header
 * 
 * @return string|null Bearer token
 */
function getBearerToken() {
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['HTTP_AUTHORIZATION'];
        if (preg_match('/Bearer\s(\S+)/', $auth, $matches)) {
            return $matches[1];
        }
    }
    return null;
}