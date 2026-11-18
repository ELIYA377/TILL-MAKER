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
    $reqId = (int)($_POST['request_id'] ?? 0);
    $action = (string)($_POST['action'] ?? '');
    $summary = trim((string)($_POST['result_summary'] ?? ''));
    $reason = trim((string)($_POST['rejection_reason'] ?? ''));
    $notes = trim((string)($_POST['internal_notes'] ?? ''));
    $refund = !empty($_POST['refund_credits']);

    $stmt = $pdo->prepare('SELECT r.*, s.name AS service_name FROM requests r JOIN services s ON s.id = r.service_id WHERE r.id = ?');
    $stmt->execute([$reqId]);
    $reqRow = $stmt->fetch();

    if ($reqRow) {
        try {
            $pdo->beginTransaction();
            if ($action === 'complete') {
                $hasFile = isset($_FILES['completed_file']) && ($_FILES['completed_file']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK;
                if (!$hasFile && $summary === '') {
                    throw new RuntimeException('Upload completed document or provide authorized result summary.');
                }
                if ($hasFile) {
                    $up = handle_secure_upload($_FILES['completed_file'], 'comp');
                    $pdo->prepare('INSERT INTO completed_documents (request_id, uploaded_by, original_filename, stored_filename, mime_type, file_size, result_note) VALUES (?, ?, ?, ?, ?, ?, ?)')
                        ->execute([$reqId, $admin['id'], $up['original_filename'], $up['stored_filename'], $up['mime_type'], $up['file_size'], $summary]);
                }
                $pdo->prepare('UPDATE requests SET status = "Completed", result_summary = ?, admin_internal_notes = ?, processed_by = ?, processed_at = NOW() WHERE id = ?')
                    ->execute([$summary ?: 'Completed document attached.', $notes, $admin['id'], $reqId]);
                create_notification((int)$reqRow['user_id'], 0, 'request_completed', 'Request Completed', "Request {$reqRow['request_code']} ({$reqRow['service_name']}) is completed.");
                $msg = "Request {$reqRow['request_code']} completed and approved.";
            } elseif ($action === 'reject') {
                if ($reason === '') {
                    throw new RuntimeException('Rejection reason is required.');
                }
                $pdo->prepare('UPDATE requests SET status = "Rejected", rejection_reason = ?, admin_internal_notes = ?, processed_by = ?, processed_at = NOW() WHERE id = ?')
                    ->execute([$reason, $notes, $admin['id'], $reqId]);
                if ($refund && $reqRow['status'] === 'Submitted') {
                    $u = $pdo->prepare('SELECT credit_balance FROM users WHERE id = ? FOR UPDATE');
                    $u->execute([$reqRow['user_id']]);
                    $bal = (float)$u->fetchColumn();
                    $newBal = round($bal + (float)$reqRow['credits_charged'], 2);
                    $pdo->prepare('UPDATE users SET credit_balance = ? WHERE id = ?')->execute([$newBal, $reqRow['user_id']]);
                    $pdo->prepare('INSERT INTO credit_transactions (user_id, type, credits, balance_before, balance_after, reference_code, description) VALUES (?, "refund", ?, ?, ?, ?, ?)')
                        ->execute([$reqRow['user_id'], $reqRow['credits_charged'], $bal, $newBal, $reqRow['request_code'], 'Refund on rejected request']);
                }
                create_notification((int)$reqRow['user_id'], 0, 'request_rejected', 'Request Rejected', "Request {$reqRow['request_code']} rejected: {$reason}");
                $msg = "Request {$reqRow['request_code']} rejected.";
            }
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            $err = $e->getMessage();
        }
    }
}

$filter = trim((string)($_GET['status'] ?? ''));
if (in_array($filter, ['Submitted', 'Completed', 'Rejected'], true)) {
    $stmt = $pdo->prepare('SELECT r.*, u.full_name, u.phone, s.name AS service_name FROM requests r JOIN users u ON u.id = r.user_id JOIN services s ON s.id = r.service_id WHERE r.status = ? ORDER BY r.id DESC');
    $stmt->execute([$filter]);
} else {
    $stmt = $pdo->query('SELECT r.*, u.full_name, u.phone, s.name AS service_name FROM requests r JOIN users u ON u.id = r.user_id JOIN services s ON s.id = r.service_id ORDER BY r.id DESC');
}
$requests = $stmt->fetchAll();

render_admin_header('Request Management', $admin, 'requests');
?>
<?php if ($msg): ?><div class="alert alert-success small"><?= e($msg) ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert alert-danger small"><?= e($err) ?></div><?php endif; ?>

<div class="btn-group btn-group-sm mb-3">
  <a href="requests.php" class="btn <?= $filter === '' ? 'btn-navy' : 'btn-outline-secondary' ?>">All</a>
  <a href="requests.php?status=Submitted" class="btn <?= $filter === 'Submitted' ? 'btn-navy' : 'btn-outline-secondary' ?>">Submitted</a>
  <a href="requests.php?status=Completed" class="btn <?= $filter === 'Completed' ? 'btn-navy' : 'btn-outline-secondary' ?>">Completed</a>
  <a href="requests.php?status=Rejected" class="btn <?= $filter === 'Rejected' ? 'btn-navy' : 'btn-outline-secondary' ?>">Rejected</a>
</div>

<?php foreach ($requests as $r):
  $docsStmt = $pdo->prepare('SELECT * FROM request_documents WHERE request_id = ?');
  $docsStmt->execute([$r['id']]);
  $docs = $docsStmt->fetchAll();
  $fields = json_decode((string)$r['submitted_data_json'], true) ?: [];
?>
<div class="card mb-3">
  <div class="card-body">
    <div class="d-flex justify-content-between align-items-start mb-2">
      <div>
        <span class="font-mono-num fw-bold"><?= e($r['request_code']) ?></span> · <strong><?= e($r['service_name']) ?></strong>
        <div class="small text-muted">Customer: <?= e($r['full_name']) ?> (<?= e($r['phone']) ?>) · <?= e((string)$r['created_at']) ?></div>
      </div>
      <span class="badge <?= $r['status'] === 'Completed' ? 'bg-success' : ($r['status'] === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark') ?>"><?= e($r['status']) ?></span>
    </div>

    <div class="row g-2 small bg-light p-2 rounded mb-3">
      <?php foreach ($fields as $k => $v): ?>
        <div class="col-md-4"><strong><?= e(ucwords(str_replace('_', ' ', (string)$k))) ?>:</strong> <?= e((string)$v) ?></div>
      <?php endforeach; ?>
      <?php if ($docs): ?>
        <div class="col-12 pt-1">
          <strong>Customer Documents:</strong>
          <?php foreach ($docs as $d): ?>
            <a href="../download.php?type=request&id=<?= (int)$d['id'] ?>" class="btn btn-outline-dark btn-sm py-0 px-2 ms-1"><?= e($d['original_filename']) ?></a>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </div>

    <form method="post" enctype="multipart/form-data" class="row g-2 align-items-end">
      <?= csrf_field() ?>
      <input type="hidden" name="request_id" value="<?= (int)$r['id'] ?>">
      <div class="col-md-3">
        <label class="form-label small fw-semibold">Completed File (PDF/JPG/PNG)</label>
        <input type="file" name="completed_file" class="form-control form-control-sm" accept=".pdf,.jpg,.jpeg,.png">
      </div>
      <div class="col-md-3">
        <label class="form-label small fw-semibold">Result Summary / Reject Reason</label>
        <input type="text" name="result_summary" class="form-control form-control-sm" placeholder="Result summary" value="<?= e((string)$r['result_summary']) ?>">
      </div>
      <div class="col-md-2">
        <label class="form-label small fw-semibold">Reject Reason</label>
        <input type="text" name="rejection_reason" class="form-control form-control-sm" placeholder="If rejecting">
      </div>
      <div class="col-md-2">
        <label class="form-label small fw-semibold">Internal Note</label>
        <input type="text" name="internal_notes" class="form-control form-control-sm" value="<?= e((string)$r['admin_internal_notes']) ?>">
      </div>
      <div class="col-md-2 d-flex gap-1">
        <button type="submit" name="action" value="complete" class="btn btn-success btn-sm flex-fill">Approve</button>
        <button type="submit" name="action" value="reject" class="btn btn-danger btn-sm flex-fill">Reject</button>
      </div>
    </form>
  </div>
</div>
<?php endforeach; ?>
<?php render_admin_footer(); ?>
