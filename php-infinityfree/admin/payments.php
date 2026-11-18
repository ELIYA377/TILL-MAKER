<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/layout_admin.php';

$admin = require_admin();
$pdo = get_db();
$filter = trim((string)($_GET['status'] ?? ''));

$totalCollected = (float)$pdo->query('SELECT COALESCE(SUM(amount_tzs), 0) FROM payments WHERE status = "Success"')->fetchColumn();
if (in_array($filter, ['Success', 'Pending', 'Failed'], true)) {
    $stmt = $pdo->prepare('SELECT p.*, u.full_name, u.phone FROM payments p JOIN users u ON u.id = p.user_id WHERE p.status = ? ORDER BY p.id DESC');
    $stmt->execute([$filter]);
    $payments = $stmt->fetchAll();
} else {
    $payments = $pdo->query('SELECT p.*, u.full_name, u.phone FROM payments p JOIN users u ON u.id = p.user_id ORDER BY p.id DESC')->fetchAll();
}

render_admin_header('Payment Management', $admin, 'payments');
?>
<div class="d-flex justify-content-between align-items-center mb-3">
  <div class="h5 fw-bold mb-0">Total Collected: <span class="font-mono-num text-success">TSh <?= number_format($totalCollected) ?></span></div>
  <div class="btn-group btn-group-sm">
    <a href="payments.php" class="btn <?= $filter === '' ? 'btn-navy' : 'btn-outline-secondary' ?>">All</a>
    <a href="payments.php?status=Success" class="btn <?= $filter === 'Success' ? 'btn-navy' : 'btn-outline-secondary' ?>">Successful</a>
    <a href="payments.php?status=Pending" class="btn <?= $filter === 'Pending' ? 'btn-navy' : 'btn-outline-secondary' ?>">Pending</a>
    <a href="payments.php?status=Failed" class="btn <?= $filter === 'Failed' ? 'btn-navy' : 'btn-outline-secondary' ?>">Failed</a>
  </div>
</div>
<div class="card">
  <div class="table-responsive">
    <table class="table table-hover small mb-0">
      <thead class="table-light"><tr><th>Order ID</th><th>User</th><th>Pay Phone</th><th>Amount</th><th>Credits</th><th>Reference</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>
        <?php foreach ($payments as $p): ?>
          <tr>
            <td class="font-mono-num fw-bold"><?= e($p['order_id']) ?></td>
            <td><?= e($p['full_name']) ?> (<?= e($p['phone']) ?>)</td>
            <td class="font-mono-num"><?= e($p['payment_phone']) ?></td>
            <td class="font-mono-num">TSh <?= number_format((float)$p['amount_tzs']) ?></td>
            <td class="font-mono-num"><?= e((string)$p['expected_credits']) ?></td>
            <td class="font-mono-num"><?= e($p['dsn_reference'] ?: '—') ?></td>
            <td><?= e($p['status']) ?></td>
            <td class="font-mono-num"><?= e((string)$p['created_at']) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php render_admin_footer(); ?>
