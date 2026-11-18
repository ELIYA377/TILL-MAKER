<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';

function start_secure_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['SERVER_PORT'] ?? 80) == 443);
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function e(?string $str): string {
    return htmlspecialchars((string)$str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function csrf_token(): string {
    start_secure_session();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_field(): string {
    return '<input type="hidden" name="csrf_token" value="' . e(csrf_token()) . '">';
}

function verify_csrf(): void {
    start_secure_session();
    $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!$token || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], (string)$token)) {
        http_response_code(403);
        exit('Security validation failed (Invalid CSRF token). Please go back, refresh, and try again.');
    }
}

function normalize_phone(string $phone): string {
    $digits = preg_replace('/\D+/', '', $phone) ?? '';
    if (str_starts_with($digits, '00255')) {
        $digits = substr($digits, 2);
    }
    if (str_starts_with($digits, '2550') && (strlen($digits) === 13 || strlen($digits) === 12)) {
        return substr($digits, 3);
    }
    if (str_starts_with($digits, '255') && strlen($digits) === 12) {
        return '0' . substr($digits, 3);
    }
    if (preg_match('/^[67]\d{8}$/', $digits)) {
        return '0' . $digits;
    }
    return $digits;
}

function phone_candidates(string $phone): array {
    $digits = preg_replace('/\D+/', '', $phone) ?? '';
    $normalized = normalize_phone($phone);
    $set = [];
    if ($normalized !== '') $set[$normalized] = true;
    if ($digits !== '') $set[$digits] = true;
    if (str_starts_with($normalized, '0') && strlen($normalized) >= 10) {
        $tail = substr($normalized, 1);
        $set[$tail] = true;
        $set['255' . $tail] = true;
        $set['255' . $normalized] = true;
    }
    return array_keys($set);
}

function is_valid_phone(string $phone): bool {
    return (bool)(preg_match('/^0[67]\d{8}$/', $phone) || preg_match('/^\d{9,15}$/', $phone));
}

function validate_three_names(string $name): bool {
    $parts = preg_split('/\s+/', trim($name));
    if (!$parts || count($parts) < 3) {
        return false;
    }
    foreach ($parts as $p) {
        if (mb_strlen($p) < 2) {
            return false;
        }
    }
    return true;
}

function log_activity(string $actorType, ?int $actorId, string $actorLabel, string $action, string $details): void {
    try {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $stmt = get_db()->prepare('INSERT INTO activity_logs (actor_type, actor_id, actor_label, action, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([$actorType, $actorId, $actorLabel, $action, $details, $ip]);
    } catch (Throwable $e) {
        // Ignore logging failure
    }
}

function create_notification(?int $userId, int $adminTarget, string $eventType, string $title, string $message): void {
    try {
        $stmt = get_db()->prepare('INSERT INTO notifications (user_id, admin_target, event_type, title, message) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$userId, $adminTarget, $eventType, $title, $message]);
    } catch (Throwable $e) {
        // Ignore
    }
}

function handle_secure_upload(array $file, string $prefix = 'doc'): array {
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('File upload failed with error code ' . ($file['error'] ?? -1));
    }
    if (($file['size'] ?? 0) > 10 * 1024 * 1024) {
        throw new RuntimeException('Uploaded file exceeds maximum 10MB limit.');
    }

    $ext = strtolower(pathinfo((string)$file['name'], PATHINFO_EXTENSION));
    $allowedExt = ['pdf', 'jpg', 'jpeg', 'png'];
    if (!in_array($ext, $allowedExt, true)) {
        throw new RuntimeException('Unsupported file format. Only PDF, JPG, JPEG, and PNG are allowed.');
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string)$finfo->file($file['tmp_name']);
    $allowedMime = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!in_array($mime, $allowedMime, true)) {
        throw new RuntimeException('Invalid file MIME type detected.');
    }

    $storedName = $prefix . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    $dest = UPLOAD_ROOT . '/' . $storedName;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        throw new RuntimeException('Failed to store uploaded file securely.');
    }

    return [
        'original_filename' => basename((string)$file['name']),
        'stored_filename' => $storedName,
        'mime_type' => $mime,
        'file_size' => (int)$file['size'],
    ];
}
