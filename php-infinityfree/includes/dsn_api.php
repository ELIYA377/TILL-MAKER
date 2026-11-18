<?php
declare(strict_types=1);

require_once __DIR__ . '/security.php';

function format_dsn_phone(string $raw): string {
    $digits = preg_replace('/\D+/', '', $raw) ?? '';
    if (str_starts_with($digits, '0') && strlen($digits) === 10) {
        return '255' . substr($digits, 1);
    }
    if (str_starts_with($digits, '255') && strlen($digits) === 12) {
        return $digits;
    }
    if ((str_starts_with($digits, '7') || str_starts_with($digits, '6')) && strlen($digits) === 9) {
        return '255' . $digits;
    }
    return $digits;
}

function dsn_api_request(string $method, string $path, ?array $body = null): array {
    $apiKey = DSN_API_KEY;
    $userId = get_setting('dsn_user_id', DSN_USER_ID);
    $url = rtrim(DSN_BASE_URL, '/') . $path;

    if (!$apiKey) {
        return [
            'ok' => false,
            'configured' => false,
            'http_code' => 503,
            'data' => null,
            'raw' => json_encode(['error' => 'DSN_API_KEY is not configured in config/config.local.php']),
            'message' => 'DSN Technology API key is not configured on the server.',
        ];
    }

    $ch = curl_init($url);
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json',
        'X-API-Key: ' . $apiKey,
        'X-User-Id: ' . $userId,
    ];

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if (strtoupper($method) === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body ?? []));
    }

    $raw = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($raw === false) {
        return [
            'ok' => false,
            'configured' => true,
            'http_code' => 502,
            'data' => null,
            'raw' => json_encode(['curl_error' => $curlErr]),
            'message' => 'Network error contacting DSN Technology: ' . $curlErr,
        ];
    }

    $decoded = json_decode((string)$raw, true);
    $rawStatus = strtolower((string)($decoded['status'] ?? $decoded['data']['status'] ?? ''));
    $ok = $httpCode >= 200 && $httpCode < 300 && empty($decoded['error']) && ($decoded['success'] ?? true) !== false && !in_array($rawStatus, ['error', 'failed'], true);

    return [
        'ok' => $ok,
        'configured' => true,
        'http_code' => $httpCode,
        'data' => $decoded,
        'raw' => (string)$raw,
        'message' => $decoded['message'] ?? $decoded['error'] ?? ($ok ? 'OK' : 'DSN API HTTP ' . $httpCode),
    ];
}

function dsn_collect_payment(string $localOrderId, int $amount, string $phone, string $name): array {
    $payload = [
        'amount' => $amount,
        'customer_phone' => format_dsn_phone($phone),
        'customer_name' => $name,
        'customer_email' => '',
        'description' => 'DIGITAL SALES CREDIT PURCHASE',
    ];
    $res = dsn_api_request('POST', '/collect', $payload);
    $d = $res['data']['data'] ?? $res['data'] ?? [];
    $remoteOrderId = (string)($d['order_id'] ?? $d['orderId'] ?? $d['order_reference'] ?? $res['data']['order_id'] ?? '');
    $logOrderId = $remoteOrderId ?: $localOrderId;

    $stmt = get_db()->prepare('INSERT INTO payment_logs (order_id, endpoint, http_method, request_payload, response_code, response_body) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$logOrderId, DSN_BASE_URL . '/collect', 'POST', json_encode($payload), $res['http_code'], substr($res['raw'], 0, 8000)]);

    return $res;
}

function dsn_check_status(string $orderId): array {
    $res = dsn_api_request('GET', '/status/' . rawurlencode($orderId));

    $stmt = get_db()->prepare('INSERT INTO payment_logs (order_id, endpoint, http_method, request_payload, response_code, response_body) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$orderId, DSN_BASE_URL . '/status/' . $orderId, 'GET', '', $res['http_code'], substr($res['raw'], 0, 8000)]);

    return $res;
}

function dsn_verify_and_settle_payment(string $orderId, ?int $onlyUserId = null): array {
    $pdo = get_db();
    $sql = $onlyUserId !== null
        ? 'SELECT * FROM payments WHERE order_id = ? AND user_id = ? LIMIT 1'
        : 'SELECT * FROM payments WHERE order_id = ? LIMIT 1';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($onlyUserId !== null ? [$orderId, $onlyUserId] : [$orderId]);
    $payment = $stmt->fetch();

    if (!$payment) {
        return ['ok' => false, 'status' => 'NotFound', 'message' => 'Payment order not found.'];
    }
    if ($payment['status'] === 'Success' && (int)$payment['credited'] === 1) {
        return ['ok' => true, 'status' => 'Success', 'message' => 'Payment already verified and credited.', 'payment' => $payment];
    }
    if ($payment['status'] === 'Failed') {
        return ['ok' => true, 'status' => 'Failed', 'message' => 'Payment failed or cancelled.', 'payment' => $payment];
    }

    $dsnRes = dsn_check_status($orderId);
    if (!$dsnRes['ok']) {
        return ['ok' => false, 'status' => 'Pending', 'message' => $dsnRes['message'], 'payment' => $payment];
    }

    $d = $dsnRes['data']['data'] ?? $dsnRes['data'] ?? [];
    $rawStatus = strtolower((string)($d['payment_status'] ?? $d['transaction_status'] ?? $d['status'] ?? $dsnRes['data']['status'] ?? 'pending'));
    $ref = (string)($d['reference'] ?? $d['gateway_reference'] ?? $d['transaction_id'] ?? $dsnRes['data']['reference'] ?? '');
    $paidAmt = isset($d['amount']) ? (float)$d['amount'] : (isset($d['paid_amount']) ? (float)$d['paid_amount'] : (float)$payment['amount_tzs']);

    if (in_array($rawStatus, ['success', 'successful', 'completed', 'complete', 'paid', 'settled', 'approved'], true)) {
        if ($paidAmt < (float)$payment['amount_tzs']) {
            return ['ok' => false, 'status' => 'Pending', 'message' => 'Verified payment amount mismatch.', 'payment' => $payment];
        }

        $pdo->beginTransaction();
        $lock = $pdo->prepare('SELECT * FROM payments WHERE id = ? FOR UPDATE');
        $lock->execute([$payment['id']]);
        $locked = $lock->fetch();
        if ($locked && (int)$locked['credited'] === 0) {
            $uLock = $pdo->prepare('SELECT id, credit_balance FROM users WHERE id = ? FOR UPDATE');
            $uLock->execute([$locked['user_id']]);
            $uRow = $uLock->fetch();
            $balBefore = (float)$uRow['credit_balance'];
            $balAfter = round($balBefore + (float)$locked['expected_credits'], 2);

            $upd = $pdo->prepare('UPDATE payments SET status = "Success", credited = 1, verified_amount = ?, dsn_reference = COALESCE(NULLIF(?, ""), dsn_reference), verified_at = NOW() WHERE id = ? AND credited = 0');
            $upd->execute([$paidAmt, $ref, $locked['id']]);
            if ($upd->rowCount() > 0) {
                $pdo->prepare('UPDATE users SET credit_balance = ? WHERE id = ?')->execute([$balAfter, $locked['user_id']]);
                $pdo->prepare('INSERT INTO credit_transactions (user_id, type, credits, balance_before, balance_after, reference_code, description) VALUES (?, "purchase", ?, ?, ?, ?, ?)')
                    ->execute([$locked['user_id'], $locked['expected_credits'], $balBefore, $balAfter, $locked['order_id'], 'DSN payment verified']);
                $pdo->commit();
                create_notification((int)$locked['user_id'], 0, 'payment_received', 'Payment Received', "Payment {$locked['order_id']} verified. {$locked['expected_credits']} credits added.");
                create_notification(null, 1, 'payment_received', 'Payment Confirmed', "Order {$locked['order_id']} settled (TSh {$locked['amount_tzs']}).");
            } else {
                $pdo->rollBack();
            }
        } else {
            $pdo->rollBack();
        }
        $freshStmt = $pdo->prepare('SELECT * FROM payments WHERE id = ?');
        $freshStmt->execute([$payment['id']]);
        return ['ok' => true, 'status' => 'Success', 'message' => "Payment verified! {$payment['expected_credits']} credits added.", 'payment' => $freshStmt->fetch()];
    }

    if (in_array($rawStatus, ['failed', 'cancelled', 'canceled', 'expired', 'rejected', 'error'], true)) {
        $pdo->prepare('UPDATE payments SET status = "Failed", dsn_reference = COALESCE(NULLIF(?, ""), dsn_reference) WHERE id = ? AND credited = 0')
            ->execute([$ref, $payment['id']]);
        $freshStmt = $pdo->prepare('SELECT * FROM payments WHERE id = ?');
        $freshStmt->execute([$payment['id']]);
        return ['ok' => true, 'status' => 'Failed', 'message' => 'Payment failed or cancelled.', 'payment' => $freshStmt->fetch()];
    }

    return ['ok' => true, 'status' => 'Pending', 'message' => 'Payment is still pending confirmation on mobile phone.', 'payment' => $payment];
}

function dsn_fetch_merchant_balance(int $adminId): array {
    $res = dsn_api_request('GET', '/balance');
    $d = $res['data']['data'] ?? $res['data'] ?? [];
    $status = !$res['configured'] ? 'Not Configured' : ($res['ok'] ? 'Connected' : 'Error');

    $avail = $res['ok'] ? (float)($d['available_balance'] ?? $d['balance'] ?? 0) : null;
    $pend = $res['ok'] ? (float)($d['pending_funds'] ?? $d['pending_balance'] ?? 0) : null;
    $resv = $res['ok'] ? (float)($d['reserved_for_withdrawals'] ?? $d['reserved'] ?? 0) : null;
    $totCol = $res['ok'] ? (float)($d['total_collected'] ?? 0) : null;
    $totFees = $res['ok'] ? (float)($d['total_collection_fees'] ?? $d['total_fees'] ?? 0) : null;
    $totNet = $res['ok'] ? (float)($d['total_net_earnings'] ?? $d['net_earnings'] ?? 0) : null;

    $stmt = get_db()->prepare('INSERT INTO merchant_balance_logs (available_balance, pending_funds, reserved_withdrawals, total_collected, total_collection_fees, total_net_earnings, api_status, raw_response, checked_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$avail, $pend, $resv, $totCol, $totFees, $totNet, $status, substr($res['raw'], 0, 8000), $adminId]);

    return [
        'ok' => $res['ok'],
        'status' => $status,
        'message' => $res['message'],
        'available_balance' => $avail,
        'pending_funds' => $pend,
        'reserved_withdrawals' => $resv,
        'total_collected' => $totCol,
        'total_collection_fees' => $totFees,
        'total_net_earnings' => $totNet,
    ];
}
