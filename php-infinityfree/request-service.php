<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/layout_user.php';

$user = require_user();
$pdo = get_db();
$serviceId = (int)($_GET['id'] ?? $_POST['service_id'] ?? 0);

$svcStmt = $pdo->prepare('SELECT * FROM services WHERE id = ? AND is_active = 1 LIMIT 1');
$svcStmt->execute([$serviceId]);
$service = $svcStmt->fetch();
if (!$service) {
    header('Location: services.php');
    exit;
}

$reqStmt = $pdo->prepare('SELECT * FROM service_requirements WHERE service_id = ? ORDER BY sort_order ASC, id ASC');
$reqStmt->execute([$serviceId]);
$requirements = $reqStmt->fetchAll();

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $cost = (float)$service['credit_cost'];
    $submittedFields = [];
    $uploadedDocs = [];

    try {
        foreach ($requirements as $req) {
            $fname = $req['field_name'];
            if ($req['field_type'] === 'file') {
                $hasFile = isset($_FILES[$fname]) && ($_FILES[$fname]['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
                if ((int)$req['is_required'] === 1 && !$hasFile) {
                    throw new RuntimeException('Missing required document: ' . $req['field_label']);
                }
                if ($hasFile) {
                    $meta = handle_secure_upload($_FILES[$fname], 'req');
                    $meta['field_label'] = $req['field_label'];
                    $uploadedDocs[] = $meta;
                }
            } else {
                $val = trim((string)($_POST['field_' . $fname] ?? ''));
                if ((int)$req['is_required'] === 1 && $val === '') {
                    throw new RuntimeException('Missing required field: ' . $req['field_label']);
                }
                $submittedFields[$fname] = $val;
            }
        }

        $pdo->beginTransaction();
        $uStmt = $pdo->prepare('SELECT credit_balance FROM users WHERE id = ? FOR UPDATE');
        $uStmt->execute([$user['id']]);
        $uRow = $uStmt->fetch();
        $balance = (float)($uRow['credit_balance'] ?? 0);
        if ($balance < $cost) {
            throw new RuntimeException("Insufficient credits. This request costs {$cost} credits.");
        }

        $newBalance = round($balance - $cost, 2);
        $requestCode = 'REQ-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));

        $pdo->prepare('UPDATE users SET credit_balance = ? WHERE id = ?')->execute([$newBalance, $user['id']]);
        $insReq = $pdo->prepare('INSERT INTO requests (request_code, user_id, service_id, submitted_data_json, credits_charged, status) VALUES (?, ?, ?, ?, ?, "Submitted")');
        $insReq->execute([$requestCode, $user['id'], $serviceId, json_encode($submittedFields), $cost]);
        $requestId = (int)$pdo->lastInsertId();

        $insDoc = $pdo->prepare('INSERT INTO request_documents (request_id, field_label, original_filename, stored_filename, mime_type, file_size) VALUES (?, ?, ?, ?, ?, ?)');
        foreach ($uploadedDocs as $doc) {
            $insDoc->execute([$requestId, $doc['field_label'], $doc['original_filename'], $doc['stored_filename'], $doc['mime_type'], $doc['file_size']]);
        }

        $pdo->prepare('INSERT INTO credit_transactions (user_id, type, credits, balance_before, balance_after, reference_code, description) VALUES (?, "deduction", ?, ?, ?, ?, ?)')
            ->execute([$user['id'], -$cost, $balance, $newBalance, $requestCode, 'Service request deduction: ' . $service['name']]);

        $pdo->commit();

        create_notification((int)$user['id'], 0, 'request_submitted', 'Request Submitted', "Request {$requestCode} submitted. {$cost} credits deducted.");
        create_notification(null, 1, 'new_request', 'New Service Request', "{$user['full_name']} submitted {$service['name']} ({$requestCode}).");
        log_activity('user', (int)$user['id'], $user['full_name'], 'REQUEST_SUBMITTED', "Submitted {$requestCode}");

        header('Location: my-requests.php?submitted=' . urlencode($requestCode));
        exit;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        foreach ($uploadedDocs as $doc) {
            @unlink(UPLOAD_ROOT . '/' . $doc['stored_filename']);
        }
        $error = $e->getMessage();
    }
}

render_user_header('Submit Request — ' . $service['name'], $user, 'services');
?>
<div class="card">
  <div class="card-header bg-navy text-white py-3 d-flex justify-content-between align-items-center">
    <div>
      <div class="small text-gold"><?= e($service['category']) ?></div>
      <h5 class="mb-0 fw-bold"><?= e($service['name']) ?></h5>
    </div>
    <span class="badge bg-warning text-dark font-mono-num"><?= e((string)$service['credit_cost']) ?> Credits</span>
  </div>
  <div class="card-body p-4">
    <div class="alert alert-light border small mb-4">
      <strong>Description:</strong> <?= e($service['description']) ?><br>
      <strong>Requirements:</strong> <?= e($service['requirements_summary']) ?>
    </div>
    <?php if ((float)$user['credit_balance'] < (float)$service['credit_cost']): ?>
      <div class="alert alert-warning d-flex justify-content-between align-items-center">
        <span class="small">Insufficient credits (<?= number_format((float)$user['credit_balance'], 2) ?> available, <?= e((string)$service['credit_cost']) ?> required).</span>
        <a href="buy-credits.php" class="btn btn-gold btn-sm">Buy Credits</a>
      </div>
    <?php endif; ?>
    <?php if ($error): ?>
      <div class="alert alert-danger small"><?= e($error) ?></div>
    <?php endif; ?>

    <form method="post" enctype="multipart/form-data" class="row g-3" onsubmit="return confirm('Confirm submission? <?= e((string)$service['credit_cost']) ?> credits will be deducted.');">
      <?= csrf_field() ?>
      <input type="hidden" name="service_id" value="<?= (int)$service['id'] ?>">
      <?php foreach ($requirements as $req): ?>
        <div class="<?= $req['field_type'] === 'textarea' ? 'col-12' : 'col-md-6' ?>">
          <label class="form-label small fw-semibold">
            <?= e($req['field_label']) ?> <?= (int)$req['is_required'] === 1 ? '<span class="text-danger">*</span>' : '' ?>
          </label>
          <?php if ($req['field_type'] === 'file'): ?>
            <input type="file" name="<?= e($req['field_name']) ?>" class="form-control" accept=".pdf,.jpg,.jpeg,.png" <?= (int)$req['is_required'] === 1 ? 'required' : '' ?>>
            <div class="form-text">Supported formats: PDF, JPG, JPEG, PNG</div>
          <?php elseif ($req['field_type'] === 'textarea'): ?>
            <textarea name="field_<?= e($req['field_name']) ?>" class="form-control" rows="3" <?= (int)$req['is_required'] === 1 ? 'required' : '' ?>></textarea>
          <?php else: ?>
            <input type="text" name="field_<?= e($req['field_name']) ?>" class="form-control" placeholder="<?= e($req['placeholder']) ?>" <?= (int)$req['is_required'] === 1 ? 'required' : '' ?>>
          <?php endif; ?>
        </div>
      <?php endforeach; ?>
      <div class="col-12 pt-3 border-top d-flex justify-content-between">
        <a href="services.php" class="btn btn-outline-secondary">Back to Services</a>
        <button type="submit" class="btn btn-gold px-4">SUBMIT REQUEST</button>
      </div>
    </form>
  </div>
</div>
<?php render_user_footer(); ?>
