<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/auth.php';

$admin = require_admin();
$pdo = get_db();
$tables = ['users','services','service_requirements','requests','request_documents','completed_documents','credit_transactions','payments','payment_logs','merchant_balance_logs','withdrawals','notifications','activity_logs','system_settings'];
$dump = [];
foreach ($tables as $t) {
    $dump[$t] = $pdo->query("SELECT * FROM `{$t}`")->fetchAll();
}
header('Content-Type: application/json');
header('Content-Disposition: attachment; filename="digital-sales-pro-max-backup-' . date('Ymd_His') . '.json"');
echo json_encode(['exported_at' => date('c'), 'tables' => $dump], JSON_PRETTY_PRINT);
exit;
