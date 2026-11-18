<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/dsn_api.php';
require_once __DIR__ . '/includes/layout_user.php';

$user = require_user();
$pdo = get_db();
$creditRate = max(1, (float)get_setting('credit_rate_tzs', '100'));
$error = '';
$success = '';

// JSON status polling endpoint for pending orders
if (!empty($_GET['check_json'])) {
    header('Content-Type: application/json; charset=utf-8');
    $orderId = trim((string)$_GET['check_json']);
    $res = dsn_verify_and_settle_payment($orderId, (int)$user['id']);
    echo json_encode([
        'ok' => $res['ok'],
        'status' => $res['status'] ?? 'Pending',
        'message' => $res['message'] ?? '',
    ]);
    exit;
}

// Check payment status action
if (!empty($_GET['check'])) {
    $orderId = trim((string)$_GET['check']);
    $res = dsn_verify_and_settle_payment($orderId, (int)$user['id']);
    if ($res['ok'] && ($res['status'] ?? '') === 'Success') {
        $success = $res['message'];
        $uStmt = $pdo->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $uStmt->execute([$user['id']]);
        $user = $uStmt->fetch() ?: $user;
    } elseif (!$res['ok'] || ($res['status'] ?? '') === 'Failed') {
        $error = $res['message'];
    } else {
        $success = $res['message'];
    }
}

// Initiate DSN Collect Payment
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $amount = (int)($_POST['amount'] ?? 0);
    $payPhone = normalize_phone((string)($_POST['phone'] ?? ''));

    if ($amount < 1000) {
        $error = 'Minimum deposit amount is TSh 1,000.';
    } elseif (!is_valid_phone($payPhone)) {
        $error = 'Please enter a valid mobile money phone number.';
    } else {
        $expectedCredits = round($amount / $creditRate, 2);
        $localOrderId = 'DS-' . strtoupper(bin2hex(random_bytes(4)));
        $res = dsn_collect_payment($localOrderId, $amount, $payPhone, $user['full_name']);
        $d = $res['data']['data'] ?? $res['data'] ?? [];
        $finalOrderId = (string)($d['order_id'] ?? $d['orderId'] ?? $d['order_reference'] ?? $res['data']['order_id'] ?? $localOrderId);
        $ref = (string)($d['reference'] ?? $d['gateway_reference'] ?? '');

        if ($res['ok']) {
            $pdo->prepare('INSERT INTO payments (order_id, user_id, amount_tzs, expected_credits, payment_phone, customer_name, description, status, dsn_reference) VALUES (?, ?, ?, ?, ?, ?, "DIGITAL SALES CREDIT PURCHASE", "Pending", ?)')
                ->execute([$finalOrderId, $user['id'], $amount, $expectedCredits, $payPhone, $user['full_name'], $ref]);
            $success = "Payment prompt sent! Order ID: {$finalOrderId}. Enter your Mobile Money PIN on your phone; status auto-checks below.";
        } else {
            $pdo->prepare('INSERT INTO payments (order_id, user_id, amount_tzs, expected_credits, payment_phone, customer_name, description, status, dsn_reference) VALUES (?, ?, ?, ?, ?, ?, "DIGITAL SALES CREDIT PURCHASE", "Failed", ?)')
                ->execute([$finalOrderId, $user['id'], $amount, $expectedCredits, $payPhone, $user['full_name'], $ref]);
            $error = $res['message'];
        }
    }
}

$pListStmt = $pdo->prepare('SELECT * FROM payments WHERE user_id = ? ORDER BY id DESC LIMIT 10');
$pListStmt->execute([$user['id']]);
$payments = $pListStmt->fetchAll();
$pendingOrderId = '';
foreach ($payments as $row) {
    if ($row['status'] === 'Pending') {
        $pendingOrderId = $row['order_id'];
        break;
    }
}

render_user_header('Buy Credits', $user, 'buy-credits');
?>
<div class="row g-4">
  <div class="col-lg-6">
    <div class="card">
      <div class="card-header bg-navy text-white fw-bold py-3">Buy Credits (DSN Mobile Money)</div>
      <div class="card-body p-4">
        <?php if ($error): ?><div class="alert alert-danger small"><?= e($error) ?></div><?php endif; ?>
        <?php if ($success): ?><div class="alert alert-success small"><?= e($success) ?></div><?php endif; ?>
        <form method="post" class="vstack gap-3">
          <?= csrf_field() ?>
          <div>
            <label class="form-label small fw-semibold">Deposit Amount (TSh — Minimum 1,000)</label>
            <input type="number" name="amount" id="amountInput" class="form-control font-mono-num" min="1000" step="100" value="1000" required oninput="updateExpected()">
            <div class="d-flex flex-wrap gap-2 mt-2">
              <?php foreach ([1000, 2000, 5000, 10000, 20000, 50000] as $pkg): ?>
                <button type="button" class="btn btn-outline-secondary btn-sm font-mono-num" onclick="document.getElementById('amountInput').value=<?= $pkg ?>;updateExpected();">
                  TSh <?= number_format($pkg) ?> (<?= number_format($pkg / $creditRate) ?> Cr)
                </button>
              <?php endforeach; ?>
            </div>
          </div>
          <div>
            <label class="form-label small fw-semibold">Mobile Money Phone Number</label>
            <input type="tel" name="phone" class="form-control font-mono-num" value="<?= e($user['phone']) ?>" required>
          </div>
          <div class="p-3 rounded bg-navy text-white d-flex justify-content-between align-items-center">
            <span class="small">Expected Credits (TSh <?= number_format($creditRate) ?>/credit):</span>
            <strong class="text-gold font-mono-num" id="expectedCredits"><?= number_format(1000 / $creditRate, 2) ?> Credits</strong>
          </div>
          <button type="submit" class="btn btn-gold w-100 py-2">PAY NOW</button>
        </form>
      </div>
    </div>
  </div>
  <div class="col-lg-6">
    <div class="card">
      <div class="card-header bg-white fw-bold">Recent Payment Orders</div>
      <div class="table-responsive">
        <table class="table table-sm mb-0 small">
          <thead class="table-light"><tr><th>Order ID</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            <?php if (!$payments): ?>
              <tr><td colspan="4" class="text-center py-4 text-muted">No payments yet.</td></tr>
            <?php else: foreach ($payments as $p): ?>
              <tr>
                <td class="font-mono-num"><?= e($p['order_id']) ?></td>
                <td class="font-mono-num">TSh <?= number_format((float)$p['amount_tzs']) ?></td>
                <td><?= e($p['status']) ?></td>
                <td>
                  <?php if ($p['status'] === 'Pending'): ?>
                    <a href="buy-credits.php?check=<?= urlencode($p['order_id']) ?>" class="btn btn-navy btn-sm py-0 px-2">Verify Status</a>
                  <?php else: ?>
                    <span class="text-muted font-mono-num"><?= e($p['dsn_reference'] ?: '—') ?></span>
                  <?php endif; ?>
                </td>
              </tr>
            <?php endforeach; endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
<script>
function updateExpected() {
  var amt = parseFloat(document.getElementById('amountInput').value) || 0;
  var rate = <?= json_encode($creditRate) ?>;
  document.getElementById('expectedCredits').innerText = (amt / rate).toFixed(2) + ' Credits';
}
var pendingOrder = <?= json_encode($pendingOrderId) ?>;
if (pendingOrder) {
  var pollCount = 0;
  var pollTimer = setInterval(function() {
    pollCount++;
    if (pollCount > 30) { clearInterval(pollTimer); return; }
    fetch('buy-credits.php?check_json=' + encodeURIComponent(pendingOrder), { credentials: 'same-origin' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.status === 'Success' || data.status === 'Failed') {
          clearInterval(pollTimer);
          window.location.href = 'buy-credits.php?check=' + encodeURIComponent(pendingOrder);
        }
      })
      .catch(function() {});
  }, 4000);
}
</script>
<?php render_user_footer(); ?>
