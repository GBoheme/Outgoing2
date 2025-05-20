<?php
/**
 * Al-Sader Wal-Wared Documents API Endpoints
 * Handles secure document operations (upload, download, list, delete)
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

// Get request data and method
$requestMethod = $_SERVER['REQUEST_METHOD'];
$endpoint = isset($_GET['action']) ? $_GET['action'] : '';

// Load environment variables
$uploadPath = envSec('UPLOAD_PATH', __DIR__ . '/../uploads');
$maxUploadSize = envSec('UPLOAD_MAX_SIZE', 20971520); // 20MB default
$allowedTypes = explode(',', envSec('UPLOAD_ALLOWED_TYPES', 'pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png'));

// Check for and create upload directory if it doesn't exist
if (!file_exists($uploadPath)) {
    mkdir($uploadPath, 0755, true);
}

// Authenticate all requests
$user = authenticateRequest($db);

try {
    switch ($endpoint) {
        case 'list':
            if ($requestMethod !== 'GET') {
                httpResponse(405, ['error' => 'Method not allowed']);
            }
            listDocuments($db, $user);
            break;
            
        case 'upload':
            if ($requestMethod !== 'POST') {
                httpResponse(405, ['error' => 'Method not allowed']);
            }
            uploadDocument($db, $user, $uploadPath, $maxUploadSize, $allowedTypes);
            break;
            
        case 'download':
            if ($requestMethod !== 'GET') {
                httpResponse(405, ['error' => 'Method not allowed']);
            }
            downloadDocument($db, $user, $uploadPath);
            break;
            
        case 'delete':
            if ($requestMethod !== 'DELETE') {
                httpResponse(405, ['error' => 'Method not allowed']);
            }
            deleteDocument($db, $user, $uploadPath);
            break;
            
        case 'stats':
            if ($requestMethod !== 'GET') {
                httpResponse(405, ['error' => 'Method not allowed']);
            }
            getDocumentStats($db, $user);
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
 * Authenticate API request and return user info
 * 
 * @param PDO $db Database connection
 * @return array User information
 */
function authenticateRequest($db) {
    $token = getBearerToken();
    if (!$token) {
        httpResponse(401, ['error' => 'Authentication required']);
    }
    
    try {
        // Decode token
        $payload = decodeJWT($token);
        
        // Get user from database
        $stmt = $db->prepare('SELECT id, username, full_name, role FROM users WHERE id = ? AND active = TRUE');
        $stmt->execute([$payload->userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            httpResponse(403, ['error' => 'User not found or inactive']);
        }
        
        // Check if token is valid in database
        $stmt = $db->prepare('
            SELECT COUNT(*) AS count FROM user_sessions 
            WHERE user_id = ? AND revoked = FALSE AND expires_at > NOW()
        ');
        $stmt->execute([$user['id']]);
        $result = $stmt->fetch();
        
        if ($result['count'] === 0) {
            httpResponse(401, ['error' => 'Session expired or revoked']);
        }
        
        return $user;
    } catch (Exception $e) {
        httpResponse(401, ['error' => 'Invalid authentication token']);
    }
}

/**
 * List documents with filtering and pagination
 * 
 * @param PDO $db Database connection
 * @param array $user Authenticated user
 */
function listDocuments($db, $user) {
    // Get query parameters
    $type = isset($_GET['type']) ? sanitizeInput($_GET['type']) : null;
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
    $offset = ($page - 1) * $limit;
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;
    
    // Build query
    $query = '
        SELECT 
            d.id, 
            d.reference_id, 
            d.title, 
            d.subject, 
            d.document_date, 
            d.sender, 
            d.document_type,
            d.file_name,
            d.file_mime_type,
            d.file_size,
            u.full_name AS created_by_name,
            d.created_at
        FROM documents d
        JOIN users u ON d.created_by = u.id
        WHERE d.deleted_at IS NULL
    ';
    
    $params = [];
    
    // If user is not admin, only show their documents
    if ($user['role'] !== 'admin') {
        $query .= ' AND d.created_by = ?';
        $params[] = $user['id'];
    }
    
    // Filter by type if provided
    if ($type && in_array($type, ['inbound', 'outbound'])) {
        $query .= ' AND d.document_type = ?';
        $params[] = $type;
    }
    
    // Add search functionality
    if ($search) {
        $query .= ' AND (d.title LIKE ? OR d.subject LIKE ? OR d.sender LIKE ? OR d.reference_id LIKE ?)';
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    // Add sorting
    $query .= ' ORDER BY d.created_at DESC';
    
    // Add pagination
    $query .= ' LIMIT ? OFFSET ?';
    $params[] = $limit;
    $params[] = $offset;
    
    // Execute query
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $documents = $stmt->fetchAll();
    
    // Count total for pagination
    $countQuery = str_replace(
        'SELECT 
            d.id, 
            d.reference_id, 
            d.title, 
            d.subject, 
            d.document_date, 
            d.sender, 
            d.document_type,
            d.file_name,
            d.file_mime_type,
            d.file_size,
            u.full_name AS created_by_name,
            d.created_at',
        'SELECT COUNT(*) AS total',
        $query
    );
    
    // Remove ORDER BY and LIMIT clauses
    $countQuery = preg_replace('/ORDER BY.*$/s', '', $countQuery);
    $countQuery = preg_replace('/LIMIT.*$/s', '', $countQuery);
    
    $stmt = $db->prepare($countQuery);
    // Remove the last two parameters (limit and offset)
    array_pop($params);
    array_pop($params);
    $stmt->execute($params);
    $total = $stmt->fetch()['total'];
    
    // Return paginated results
    httpResponse(200, [
        'documents' => $documents,
        'pagination' => [
            'total' => (int)$total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * Upload a new document
 * 
 * @param PDO $db Database connection
 * @param array $user Authenticated user
 * @param string $uploadPath Path to upload directory
 * @param int $maxUploadSize Maximum allowed upload size
 * @param array $allowedTypes Allowed file types
 */
function uploadDocument($db, $user, $uploadPath, $maxUploadSize, $allowedTypes) {
    // Validate form data
    $requestData = $_POST;
    
    if (!isset($requestData['title']) || !isset($requestData['subject']) || !isset($requestData['sender']) || 
        !isset($requestData['document_date']) || !isset($requestData['document_type'])) {
        httpResponse(400, ['error' => 'Missing required fields']);
    }
    
    // Sanitize and validate inputs
    $title = sanitizeInput($requestData['title']);
    $subject = sanitizeInput($requestData['subject']);
    $sender = sanitizeInput($requestData['sender']);
    $documentDate = sanitizeInput($requestData['document_date']);
    $documentType = sanitizeInput($requestData['document_type']);
    
    // Validate document type
    if (!in_array($documentType, ['inbound', 'outbound'])) {
        httpResponse(400, ['error' => 'Invalid document type']);
    }
    
    // Validate date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $documentDate)) {
        httpResponse(400, ['error' => 'Invalid date format. Use YYYY-MM-DD']);
    }
    
    // Handle file upload
    $fileUploaded = false;
    $filePath = null;
    $fileName = null;
    $fileMimeType = null;
    $fileSize = null;
    $fileHash = null;
    
    if (isset($_FILES['file']) && $_FILES['file']['error'] == UPLOAD_ERR_OK) {
        // Check file size
        if ($_FILES['file']['size'] > $maxUploadSize) {
            httpResponse(400, ['error' => 'File size exceeds the maximum allowed size']);
        }
        
        // Check file type
        $fileInfo = pathinfo($_FILES['file']['name']);
        $extension = strtolower($fileInfo['extension']);
        
        if (!in_array($extension, $allowedTypes)) {
            httpResponse(400, ['error' => 'File type not allowed']);
        }
        
        // Generate a secure filename
        $fileName = $_FILES['file']['name'];
        $safeFileName = bin2hex(random_bytes(16)) . '.' . $extension;
        
        // Create year/month directory structure
        $yearMonth = date('Y/m');
        $uploadDir = $uploadPath . '/' . $yearMonth;
        
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $filePath = $yearMonth . '/' . $safeFileName;
        $fullPath = $uploadPath . '/' . $filePath;
        
        // Move uploaded file
        if (move_uploaded_file($_FILES['file']['tmp_name'], $fullPath)) {
            $fileUploaded = true;
            $fileMimeType = mime_content_type($fullPath);
            $fileSize = filesize($fullPath);
            $fileHash = hash_file('sha512', $fullPath);
        } else {
            httpResponse(500, ['error' => 'Failed to upload file']);
        }
    }
    
    // Generate reference ID using stored procedure
    $stmt = $db->prepare('CALL generate_document_reference_id(?, @reference_id)');
    $stmt->execute([$documentType]);
    
    $stmt = $db->query('SELECT @reference_id as reference_id');
    $referenceId = $stmt->fetch()['reference_id'];
    
    // Insert document into database
    $stmt = $db->prepare('
        INSERT INTO documents (
            reference_id, title, subject, document_date, sender, document_type,
            file_path, file_name, file_mime_type, file_size, file_hash, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    
    $stmt->execute([
        $referenceId,
        $title,
        $subject,
        $documentDate,
        $sender,
        $documentType,
        $fileUploaded ? $filePath : null,
        $fileUploaded ? $fileName : null,
        $fileUploaded ? $fileMimeType : null,
        $fileUploaded ? $fileSize : null,
        $fileUploaded ? $fileHash : null,
        $user['id']
    ]);
    
    $documentId = $db->lastInsertId();
    
    // Log the action
    logDocumentAction($db, $documentId, $user['id'], 'create');
    
    // Return the created document
    httpResponse(201, [
        'success' => true,
        'document' => [
            'id' => $documentId,
            'reference_id' => $referenceId,
            'title' => $title,
            'subject' => $subject,
            'document_date' => $documentDate,
            'sender' => $sender,
            'document_type' => $documentType,
            'file_uploaded' => $fileUploaded,
            'file_name' => $fileName
        ]
    ]);
}

/**
 * Download a document
 * 
 * @param PDO $db Database connection
 * @param array $user Authenticated user
 * @param string $uploadPath Path to upload directory
 */
function downloadDocument($db, $user, $uploadPath) {
    // Get document ID
    if (!isset($_GET['id'])) {
        httpResponse(400, ['error' => 'Document ID is required']);
    }
    
    $documentId = intval($_GET['id']);
    
    // Get document from database
    $stmt = $db->prepare('
        SELECT d.*, u.username as owner_username
        FROM documents d
        JOIN users u ON d.created_by = u.id
        WHERE d.id = ? AND d.deleted_at IS NULL
    ');
    $stmt->execute([$documentId]);
    $document = $stmt->fetch();
    
    if (!$document) {
        httpResponse(404, ['error' => 'Document not found']);
    }
    
    // Check permission (admin can access all, users can only access their own)
    if ($user['role'] !== 'admin' && $document['created_by'] != $user['id']) {
        httpResponse(403, ['error' => 'You do not have permission to access this document']);
    }
    
    // Check if file exists
    if (!$document['file_path']) {
        httpResponse(404, ['error' => 'Document has no file attached']);
    }
    
    $filePath = $uploadPath . '/' . $document['file_path'];
    
    if (!file_exists($filePath)) {
        httpResponse(404, ['error' => 'File not found']);
    }
    
    // Verify file integrity
    $fileHash = hash_file('sha512', $filePath);
    if ($fileHash !== $document['file_hash']) {
        error_log('File integrity check failed for document #' . $documentId);
        httpResponse(500, ['error' => 'File integrity check failed']);
    }
    
    // Log the download
    logDocumentAction($db, $documentId, $user['id'], 'download');
    
    // Set headers for download
    header('Content-Type: application/json');
    header('Content-Disposition: attachment; filename="' . $document['file_name'] . '"');
    header('Content-Length: ' . $document['file_size']);
    header('Content-Type: ' . $document['file_mime_type']);
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // Output file and exit
    readfile($filePath);
    exit;
}

/**
 * Delete a document (soft delete)
 * 
 * @param PDO $db Database connection
 * @param array $user Authenticated user
 * @param string $uploadPath Path to upload directory
 */
function deleteDocument($db, $user, $uploadPath) {
    // Get JSON data
    $requestData = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($requestData['id'])) {
        httpResponse(400, ['error' => 'Document ID is required']);
    }
    
    $documentId = intval($requestData['id']);
    
    // Get document from database
    $stmt = $db->prepare('
        SELECT * FROM documents 
        WHERE id = ? AND deleted_at IS NULL
    ');
    $stmt->execute([$documentId]);
    $document = $stmt->fetch();
    
    if (!$document) {
        httpResponse(404, ['error' => 'Document not found']);
    }
    
    // Check permission (admin can delete all, users can only delete their own)
    if ($user['role'] !== 'admin' && $document['created_by'] != $user['id']) {
        httpResponse(403, ['error' => 'You do not have permission to delete this document']);
    }
    
    // Soft delete document
    $stmt = $db->prepare('
        UPDATE documents 
        SET deleted_at = NOW() 
        WHERE id = ?
    ');
    $stmt->execute([$documentId]);
    
    // Log the action
    logDocumentAction($db, $documentId, $user['id'], 'delete');
    
    httpResponse(200, ['success' => true, 'message' => 'Document deleted successfully']);
}

/**
 * Get document statistics
 * 
 * @param PDO $db Database connection
 * @param array $user Authenticated user
 */
function getDocumentStats($db, $user) {
    // Get query parameters
    $period = isset($_GET['period']) ? sanitizeInput($_GET['period']) : 'all';
    $userParam = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    
    // Check permission for user filter
    if ($userParam && $user['role'] !== 'admin' && $userParam != $user['id']) {
        httpResponse(403, ['error' => 'You do not have permission to view other users\' statistics']);
    }
    
    // Build query conditions
    $conditions = ['deleted_at IS NULL'];
    $params = [];
    
    // Add user condition if needed
    if ($user['role'] !== 'admin') {
        $conditions[] = 'created_by = ?';
        $params[] = $user['id'];
    } else if ($userParam) {
        $conditions[] = 'created_by = ?';
        $params[] = $userParam;
    }
    
    // Add time period condition
    if ($period !== 'all') {
        switch ($period) {
            case 'today':
                $conditions[] = 'DATE(created_at) = CURDATE()';
                break;
            case 'week':
                $conditions[] = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
                break;
            case 'month':
                $conditions[] = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
                break;
            case 'year':
                $conditions[] = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
                break;
        }
    }
    
    // Build WHERE clause
    $whereClause = implode(' AND ', $conditions);
    
    // Total documents
    $stmt = $db->prepare("
        SELECT COUNT(*) as total 
        FROM documents 
        WHERE $whereClause
    ");
    $stmt->execute($params);
    $total = $stmt->fetch()['total'];
    
    // Documents by type
    $stmt = $db->prepare("
        SELECT document_type, COUNT(*) as count 
        FROM documents 
        WHERE $whereClause 
        GROUP BY document_type
    ");
    $stmt->execute($params);
    $byType = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    
    // Latest document references
    $stmt = $db->prepare("
        SELECT document_type, reference_id, created_at
        FROM documents
        WHERE $whereClause
        ORDER BY created_at DESC
        LIMIT 2
    ");
    $stmt->execute($params);
    $latest = $stmt->fetchAll();
    
    // Monthly stats for chart
    $stmt = $db->prepare("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            document_type,
            COUNT(*) as count
        FROM documents
        WHERE $whereClause
        GROUP BY DATE_FORMAT(created_at, '%Y-%m'), document_type
        ORDER BY month
    ");
    $stmt->execute($params);
    $monthlyData = $stmt->fetchAll();
    
    // Format monthly data for charts
    $formattedMonthly = [];
    foreach ($monthlyData as $row) {
        if (!isset($formattedMonthly[$row['month']])) {
            $formattedMonthly[$row['month']] = [
                'month' => $row['month'],
                'inbound' => 0,
                'outbound' => 0
            ];
        }
        $formattedMonthly[$row['month']][$row['document_type']] = $row['count'];
    }
    
    // Return stats
    httpResponse(200, [
        'total' => (int)$total,
        'inboundCount' => (int)($byType['inbound'] ?? 0),
        'outboundCount' => (int)($byType['outbound'] ?? 0),
        'lastInboundRef' => getLatestRefForType($latest, 'inbound'),
        'lastOutboundRef' => getLatestRefForType($latest, 'outbound'),
        'chartData' => array_values($formattedMonthly)
    ]);
}

/**
 * Get latest reference ID for a document type from latest documents
 * 
 * @param array $latest Latest documents
 * @param string $type Document type
 * @return string Latest reference ID or empty string
 */
function getLatestRefForType($latest, $type) {
    foreach ($latest as $doc) {
        if ($doc['document_type'] === $type) {
            return $doc['reference_id'];
        }
    }
    return '';
}

/**
 * Log document action for audit trail
 * 
 * @param PDO $db Database connection
 * @param int $documentId Document ID
 * @param int $userId User ID
 * @param string $action Action performed
 */
function logDocumentAction($db, $documentId, $userId, $action) {
    $stmt = $db->prepare('
        INSERT INTO document_access_log (document_id, user_id, action, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?)
    ');
    
    $ipAddress = $_SERVER['REMOTE_ADDR'];
    $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
    
    $stmt->execute([$documentId, $userId, $action, $ipAddress, $userAgent]);
}

/**
 * Send HTTP response in JSON format
 * 
 * @param int $statusCode HTTP status code
 * @param array $data Response data
 */
function httpResponse($statusCode, $data) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}