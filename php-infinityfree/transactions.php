<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/layout_user.php';

$user = require_user();
$tab = ($_GET['tab'] ?? 'credits') === 'payments' ? 'payments' : 'credits';
$pdo = get_db();

render_user_header($tab === 'payments' ? 'Payment History' : 'Credit History', $user, $tab);
if ($tab === 'payments'):
    $stmt = $pdo->prepare('SELECT * FROM payments WHERE user_id = ? ORDER BY id DESC');
    $stmt->execute([$user['id']]);
    $rows = $stmt->fetchAll();
?>
<div class="card">
  <div class="card-header bg-white fw-bold">Payment History</div>
  <div class="table-responsive">
    <table class="table table-hover small mb-0">
      <thead class="table-light"><tr><th>Order ID</th><th>Phone</th><th>Amount</th><th>Credits</th><th>Reference</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>
        <?php foreach ($rows as $r): ?>
          <tr>
            <td class="font-mono-num"><?= e($r['order_id']) ?></td>
            <td class="font-mono-num"><?= e($r['payment_phone']) ?></td>
            <td class="font-mono-num">TSh <?= number_format((float)$r['amount_tzs']) ?></td>
            <td class="font-mono-num"><?= e((string)$r['expected_credits']) ?></td>
            <td class="font-mono-num"><?= e($r['dsn_reference'] ?: '—') ?></td>
            <td><?= e($r['status']) ?></td>
            <td class="font-mono-num"><?= e((string)$r['created_at']) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php else:
    $stmt = $pdo->prepare('SELECT * FROM credit_transactions WHERE user_id = ? ORDER BY id DESC');
    $stmt->execute([$user['id']]);
    $rows = $stmt->fetchAll();
?>
<div class="card">
  <div class="card-header bg-white fw-bold">Credit Transaction History</div>
  <div class="table-responsive">
    <table class="table table-hover small mb-0">
      <thead class="table-light"><tr><th>Date</th><th>Type</th><th>Reference</th><th>Description</th><th>Credits</th><th>Balance After</th></tr></thead>
      <tbody>
        <?php foreach ($rows as $r): ?>
          <tr>
            <td class="font-mono-num"><?= e((string)$r['created_at']) ?></td>
            <td><?= e($r['type']) ?></td>
            <td class="font-mono-num"><?= e($r['reference_code']) ?></td>
            <td><?= e($r['description']) ?></td>
            <td class="font-mono-num fw-bold"><?= (float)$r['credits'] >= 0 ? '+' : '' ?><?= e((string)$r['credits']) ?></td>
            <td class="font-mono-num"><?= e((string)$r['balance_after']) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php endif; render_user_footer(); ?>
