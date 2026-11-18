<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/dsn_api.php';

header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents('php://input');
$payload = json_decode((string)$raw, true);
if (!is_array($payload)) {
    $payload = $_POST;
}

$orderId = trim((string)($payload['order_id'] ?? $payload['orderId'] ?? $payload['order_reference'] ?? ($payload['data']['order_id'] ?? '')));
if ($orderId === '') {
    echo json_encode(['success' => true, 'ignored' => true, 'message' => 'Missing order_id']);
    exit;
}

// Never blindly trust webhook payload; verify directly with DSN /status/{order_id}
$result = dsn_verify_and_settle_payment($orderId);
echo json_encode([
    'success' => true,
    'status' => $result['status'] ?? 'Unknown',
]);
