<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';

$user = current_user();
$admin = current_admin();
if (!$user && !$admin) {
    http_response_code(401);
    exit('Unauthorized');
}

$type = ($_GET['type'] ?? '') === 'completed' ? 'completed' : 'request';
$id = (int)($_GET['id'] ?? 0);
$pdo = get_db();

if ($type === 'completed') {
    $stmt = $pdo->prepare('SELECT c.*, r.user_id, r.status FROM completed_documents c JOIN requests r ON r.id = c.request_id WHERE c.id = ? LIMIT 1');
} else {
    $stmt = $pdo->prepare('SELECT d.*, r.user_id, r.status FROM request_documents d JOIN requests r ON r.id = d.request_id WHERE d.id = ? LIMIT 1');
}
$stmt->execute([$id]);
$doc = $stmt->fetch();

if (!$doc) {
    http_response_code(404);
    exit('Document not found');
}
if (!$admin) {
    if ((int)$doc['user_id'] !== (int)$user['id'] || ($type === 'completed' && $doc['status'] !== 'Completed')) {
        http_response_code(403);
        exit('Access denied');
    }
}

$path = UPLOAD_ROOT . '/' . basename($doc['stored_filename']);
if (!is_file($path)) {
    http_response_code(404);
    exit('File missing');
}

header('Content-Type: ' . $doc['mime_type']);
header('Content-Disposition: attachment; filename="' . str_replace('"', '', $doc['original_filename']) . '"');
header('Content-Length: ' . filesize($path));
readfile($path);
exit;
