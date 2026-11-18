<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/layout_user.php';

$user = require_user();
$pdo = get_db();

$reqStmt = $pdo->prepare('SELECT r.*, s.name AS service_name FROM requests r JOIN services s ON s.id = r.service_id WHERE r.user_id = ? ORDER BY r.id DESC LIMIT 6');
$reqStmt->execute([$user['id']]);
$recentRequests = $reqStmt->fetchAll();

$cntStmt = $pdo->prepare('SELECT COUNT(*) AS total, SUM(status="Submitted") AS sub_cnt, SUM(status="Completed") AS comp_cnt FROM requests WHERE user_id = ?');
$cntStmt->execute([$user['id']]);
$counts = $cntStmt->fetch() ?: ['total' => 0, 'sub_cnt' => 0, 'comp_cnt' => 0];

render_user_header('User Dashboard', $user, 'dashboard');
?>
<div class="card bg-navy text-white mb-4 border-0">
  <div class="card-body p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
    <div>
      <div class="small text-gold fw-semibold">Welcome back</div>
      <h4 class="fw-bold mb-1"><?= e($user['full_name']) ?></h4>
      <div class="small text-light font-mono-num">Phone: <?= e($user['phone']) ?></div>
    </div>
    <div class="d-flex flex-wrap gap-2 align-items-center">
      <div class="bg-navy-soft px-3 py-2 rounded border border-secondary">
        <div class="small text-light">Available Credits</div>
        <div class="h5 fw-bold text-gold mb-0 font-mono-num"><?= number_format((float)$user['credit_balance'], 2) ?></div>
      </div>
      <a href="buy-credits.php" class="btn btn-gold">BUY CREDITS</a>
      <a href="services.php" class="btn btn-light fw-semibold">NEW REQUEST</a>
    </div>
  </div>
</div>

<div class="row g-3 mb-4">
  <div class="col-6 col-lg-3"><div class="card p-3"><div class="small text-muted">Total Requests</div><div class="h4 fw-bold font-mono-num mb-0"><?= (int)$counts['total'] ?></div></div></div>
  <div class="col-6 col-lg-3"><div class="card p-3"><div class="small text-muted">Submitted</div><div class="h4 fw-bold text-warning font-mono-num mb-0"><?= (int)$counts['sub_cnt'] ?></div></div></div>
  <div class="col-6 col-lg-3"><div class="card p-3"><div class="small text-muted">Completed</div><div class="h4 fw-bold text-success font-mono-num mb-0"><?= (int)$counts['comp_cnt'] ?></div></div></div>
  <div class="col-6 col-lg-3"><div class="card p-3"><div class="small text-muted">Request Fee</div><div class="h4 fw-bold font-mono-num mb-0">2 Credits</div></div></div>
</div>

<div class="card">
  <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
    <span>Recent Requests</span>
    <a href="my-requests.php" class="small text-decoration-none">View All</a>
  </div>
  <div class="table-responsive">
    <table class="table table-hover mb-0 small">
      <thead class="table-light">
        <tr><th>Request ID</th><th>Service</th><th>Credits</th><th>Status</th><th>Date</th></tr>
      </thead>
      <tbody>
        <?php if (!$recentRequests): ?>
          <tr><td colspan="5" class="text-center py-4 text-muted">No requests submitted yet.</td></tr>
        <?php else: foreach ($recentRequests as $r): ?>
          <tr>
            <td class="font-mono-num fw-bold"><?= e($r['request_code']) ?></td>
            <td><?= e($r['service_name']) ?></td>
            <td class="font-mono-num"><?= e((string)$r['credits_charged']) ?></td>
            <td><span class="fw-semibold"><?= e($r['status']) ?></span></td>
            <td class="font-mono-num"><?= e((string)$r['created_at']) ?></td>
          </tr>
        <?php endforeach; endif; ?>
      </tbody>
    </table>
  </div>
</div>
<?php render_user_footer(); ?>
