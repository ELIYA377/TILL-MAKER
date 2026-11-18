<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/layout_user.php';

$user = require_user();
$pdo = get_db();
$statusFilter = trim((string)($_GET['status'] ?? ''));

if (in_array($statusFilter, ['Submitted', 'Completed', 'Rejected'], true)) {
    $stmt = $pdo->prepare('SELECT r.*, s.name AS service_name, s.category AS service_category FROM requests r JOIN services s ON s.id = r.service_id WHERE r.user_id = ? AND r.status = ? ORDER BY r.id DESC');
    $stmt->execute([$user['id'], $statusFilter]);
} else {
    $stmt = $pdo->prepare('SELECT r.*, s.name AS service_name, s.category AS service_category FROM requests r JOIN services s ON s.id = r.service_id WHERE r.user_id = ? ORDER BY r.id DESC');
    $stmt->execute([$user['id']]);
}
$requests = $stmt->fetchAll();

render_user_header($statusFilter === 'Completed' ? 'Completed Requests' : 'My Requests', $user, $statusFilter === 'Completed' ? 'completed' : 'requests');
?>
<?php if (!empty($_GET['submitted'])): ?>
  <div class="alert alert-success small">Request <strong><?= e((string)$_GET['submitted']) ?></strong> submitted successfully!</div>
<?php endif; ?>

<div class="d-flex justify-content-between align-items-center mb-3">
  <h4 class="fw-bold mb-0"><?= $statusFilter === 'Completed' ? 'Completed Requests' : 'My Requests' ?></h4>
  <div class="btn-group btn-group-sm">
    <a href="my-requests.php" class="btn <?= $statusFilter === '' ? 'btn-navy' : 'btn-outline-secondary' ?>">All</a>
    <a href="my-requests.php?status=Submitted" class="btn <?= $statusFilter === 'Submitted' ? 'btn-navy' : 'btn-outline-secondary' ?>">Submitted</a>
    <a href="my-requests.php?status=Completed" class="btn <?= $statusFilter === 'Completed' ? 'btn-navy' : 'btn-outline-secondary' ?>">Completed</a>
    <a href="my-requests.php?status=Rejected" class="btn <?= $statusFilter === 'Rejected' ? 'btn-navy' : 'btn-outline-secondary' ?>">Rejected</a>
  </div>
</div>

<?php if (!$requests): ?>
  <div class="card p-5 text-center text-muted">No requests found.</div>
<?php else: foreach ($requests as $r):
  $compDocs = [];
  if ($r['status'] === 'Completed') {
      $cd = $pdo->prepare('SELECT * FROM completed_documents WHERE request_id = ?');
      $cd->execute([$r['id']]);
      $compDocs = $cd->fetchAll();
  }
?>
  <div class="card mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <div class="small text-muted font-mono-num"><?= e($r['request_code']) ?> · <?= e($r['service_category']) ?> · <?= e((string)$r['created_at']) ?></div>
          <h6 class="fw-bold mb-1"><?= e($r['service_name']) ?></h6>
        </div>
        <span class="badge <?= $r['status'] === 'Completed' ? 'bg-success' : ($r['status'] === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark') ?>">
          <?= e($r['status']) ?>
        </span>
      </div>
      <?php if ($r['status'] === 'Rejected' && $r['rejection_reason']): ?>
        <div class="alert alert-danger small mt-3 mb-0"><strong>Reason:</strong> <?= e($r['rejection_reason']) ?></div>
      <?php endif; ?>
      <?php if ($r['status'] === 'Completed'): ?>
        <div class="alert alert-success small mt-3 mb-0">
          <div><strong>Completed Result:</strong> <?= e((string)$r['result_summary']) ?></div>
          <?php foreach ($compDocs as $doc): ?>
            <a href="download.php?type=completed&id=<?= (int)$doc['id'] ?>" class="btn btn-navy btn-sm mt-2 me-2">
              <i class="bi bi-download"></i> Download <?= e($doc['original_filename']) ?>
            </a>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </div>
  </div>
<?php endforeach; endif; ?>
<?php render_user_footer(); ?>
