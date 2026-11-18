<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/layout_admin.php';

$admin = require_admin();
$pdo = get_db();
$msg = '';
$err = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $amount = (float)($_POST['amount'] ?? 0);
    $network = (string)($_POST['network'] ?? '');
    $phone = normalize_phone((string)($_POST['recipient_phone'] ?? ''));
    $name = trim((string)($_POST['recipient_name'] ?? ''));
    $notes = trim((string)($_POST['notes'] ?? ''));
    $allowed = ['Airtel Money', 'Yas Pesa', 'M-Pesa', 'HaloPesa'];

    if ($amount < 1000 || !in_array($network, $allowed, true) || !is_valid_phone($phone) || $name === '') {
        $err = 'Please provide valid amount (>= 1000), network, phone, and recipient name.';
    } else {
        $code = 'WD-' . strtoupper(bin2hex(random_bytes(4)));
        $pdo->prepare('INSERT INTO withdrawals (withdrawal_code, admin_id, amount_tzs, network, recipient_phone, recipient_name, status, notes) VALUES (?, ?, ?, ?, ?, ?, "Pending", ?)')
            ->execute([$code, $admin['id'], $amount, $network, $phone, $name, $notes]);
        log_activity('admin', (int)$admin['id'], $admin['full_name'], 'WITHDRAWAL_QUEUED', "Recorded {$code} for TSh {$amount}");
        $msg = "Withdrawal {$code} queued as Pending until official DSN withdrawal API activation.";
    }
}

$withdrawals = $pdo->query('SELECT w.*, a.full_name AS admin_name FROM withdrawals w JOIN admins a ON a.id = w.admin_id ORDER BY w.id DESC')->fetchAll();
render_admin_header('Withdraw Money', $admin, 'withdrawals');
?>
<?php if ($msg): ?><div class="alert alert-success small"><?= e($msg) ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert alert-danger small"><?= e($err) ?></div><?php endif; ?>

<div class="alert alert-warning small">
  Official DSN Technology payout/withdrawal API integration is pending activation. Withdrawals submitted here are stored securely as Pending.
</div>

<div class="row g-4">
  <div class="col-lg-5">
    <div class="card p-4">
      <h6 class="fw-bold mb-3">Request Withdrawal</h6>
      <form method="post" class="vstack gap-3" onsubmit="return confirm('Confirm withdrawal request details?');">
        <?= csrf_field() ?>
        <div><label class="form-label small fw-semibold">Amount (TSh)</label><input type="number" name="amount" min="1000" class="form-control font-mono-num" required></div>
        <div>
          <label class="form-label small fw-semibold">Network</label>
          <select name="network" class="form-select">
            <option>Airtel Money</option><option>Yas Pesa</option><option>M-Pesa</option><option>HaloPesa</option>
          </select>
        </div>
        <div><label class="form-label small fw-semibold">Recipient Phone</label><input type="tel" name="recipient_phone" class="form-control font-mono-num" required></div>
        <div><label class="form-label small fw-semibold">Recipient Name</label><input type="text" name="recipient_name" class="form-control" required></div>
        <div><label class="form-label small fw-semibold">Notes</label><input type="text" name="notes" class="form-control"></div>
        <button type="submit" class="btn btn-gold">Confirm Withdrawal</button>
      </form>
    </div>
  </div>
  <div class="col-lg-7">
    <div class="card">
      <div class="card-header bg-white fw-bold">Withdrawal History</div>
      <div class="table-responsive">
        <table class="table table-sm small mb-0">
          <thead class="table-light"><tr><th>Code</th><th>Network</th><th>Recipient</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            <?php foreach ($withdrawals as $w): ?>
              <tr>
                <td class="font-mono-num fw-bold"><?= e($w['withdrawal_code']) ?></td>
                <td><?= e($w['network']) ?></td>
                <td><?= e($w['recipient_name']) ?> (<?= e($w['recipient_phone']) ?>)</td>
                <td class="font-mono-num">TSh <?= number_format((float)$w['amount_tzs']) ?></td>
                <td><?= e($w['status']) ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
<?php render_admin_footer(); ?>
