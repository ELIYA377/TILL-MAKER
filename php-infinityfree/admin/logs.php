<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/layout_admin.php';

$admin = require_admin();
$pdo = get_db();
$logs = $pdo->query('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 120')->fetchAll();
$creditReport = $pdo->query('SELECT COALESCE(SUM(CASE WHEN type="purchase" THEN credits ELSE 0 END),0) AS purchased, COALESCE(SUM(CASE WHEN type="deduction" THEN ABS(credits) ELSE 0 END),0) AS deducted, COALESCE(SUM(CASE WHEN type="admin_add" THEN credits ELSE 0 END),0) AS admin_added FROM credit_transactions')->fetch();

render_admin_header('Credit Reports & Activity Logs', $admin, 'logs');
?>
<div class="row g-3 mb-4">
  <div class="col-md-4"><div class="card p-3"><div class="small text-muted">Credits Purchased</div><div class="h4 fw-bold font-mono-num"><?= e((string)$creditReport['purchased']) ?></div></div></div>
  <div class="col-md-4"><div class="card p-3"><div class="small text-muted">Credits Deducted</div><div class="h4 fw-bold font-mono-num"><?= e((string)$creditReport['deducted']) ?></div></div></div>
  <div class="col-md-4"><div class="card p-3"><div class="small text-muted">Admin Credits Added</div><div class="h4 fw-bold font-mono-num"><?= e((string)$creditReport['admin_added']) ?></div></div></div>
</div>

<div class="card">
  <div class="card-header bg-white fw-bold">Activity Logs</div>
  <div class="table-responsive">
    <table class="table table-sm small mb-0">
      <thead class="table-light"><tr><th>Time</th><th>Actor</th><th>Action</th><th>Details</th></tr></thead>
      <tbody>
        <?php foreach ($logs as $l): ?>
          <tr>
            <td class="font-mono-num"><?= e((string)$l['created_at']) ?></td>
            <td><?= e($l['actor_label']) ?></td>
            <td class="font-mono-num fw-semibold"><?= e($l['action']) ?></td>
            <td><?= e($l['details']) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php render_admin_footer(); ?>
