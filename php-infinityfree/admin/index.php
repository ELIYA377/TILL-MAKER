<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/layout_admin.php';

$admin = require_admin();
$pdo = get_db();

$usersCount = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
$reqSub = (int)$pdo->query('SELECT COUNT(*) FROM requests WHERE status = "Submitted"')->fetchColumn();
$reqComp = (int)$pdo->query('SELECT COUNT(*) FROM requests WHERE status = "Completed"')->fetchColumn();
$totCollected = (float)$pdo->query('SELECT COALESCE(SUM(amount_tzs), 0) FROM payments WHERE status = "Success"')->fetchColumn();
$notifs = $pdo->query('SELECT * FROM notifications WHERE admin_target = 1 ORDER BY id DESC LIMIT 15')->fetchAll();

render_admin_header('Admin Overview', $admin, 'index');
?>
<div class="row g-3 mb-4">
  <div class="col-6 col-lg-3"><div class="card p-3"><div class="small text-muted">Registered Users</div><div class="h4 fw-bold font-mono-num mb-0"><?= $usersCount ?></div></div></div>
  <div class="col-6 col-lg-3"><div class="card p-3"><div class="small text-muted">Submitted Requests</div><div class="h4 fw-bold text-warning font-mono-num mb-0"><?= $reqSub ?></div></div></div>
  <div class="col-6 col-lg-3"><div class="card p-3"><div class="small text-muted">Completed Requests</div><div class="h4 fw-bold text-success font-mono-num mb-0"><?= $reqComp ?></div></div></div>
  <div class="col-6 col-lg-3"><div class="card p-3"><div class="small text-muted">Total Collected</div><div class="h4 fw-bold font-mono-num mb-0">TSh <?= number_format($totCollected) ?></div></div></div>
</div>

<div class="card">
  <div class="card-header bg-white fw-bold">Admin Notifications</div>
  <div class="list-group list-group-flush">
    <?php if (!$notifs): ?>
      <div class="p-4 text-center text-muted small">No notifications yet.</div>
    <?php else: foreach ($notifs as $n): ?>
      <div class="list-group-item small d-flex justify-content-between">
        <div><strong><?= e($n['title']) ?></strong> — <?= e($n['message']) ?></div>
        <span class="text-muted font-mono-num"><?= e((string)$n['created_at']) ?></span>
      </div>
    <?php endforeach; endif; ?>
  </div>
</div>
<?php render_admin_footer(); ?>
