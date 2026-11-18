<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/layout_admin.php';

$admin = require_admin();
$pdo = get_db();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = (string)($_POST['action'] ?? '');
    if ($action === 'create') {
        $cat = (string)$_POST['category'];
        $name = trim((string)$_POST['name']);
        $desc = trim((string)$_POST['description']);
        $reqSum = trim((string)$_POST['requirements_summary']);
        $cost = (float)$_POST['credit_cost'];
        $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name)) . '-' . time();
        $pdo->prepare('INSERT INTO services (category, name, slug, description, requirements_summary, credit_cost, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, 1, 99)')
            ->execute([$cat, $name, $slug, $desc, $reqSum, $cost]);
        $sid = (int)$pdo->lastInsertId();
        $pdo->prepare('INSERT INTO service_requirements (service_id, field_label, field_name, field_type, is_required, sort_order) VALUES (?, "Applicant Details", "applicant_details", "text", 1, 1), (?, "Supporting Document (PDF/JPG/PNG)", "supporting_doc", "file", 1, 2)')
            ->execute([$sid, $sid]);
        $msg = 'Service added.';
    } elseif ($action === 'update') {
        $sid = (int)$_POST['service_id'];
        $cost = (float)$_POST['credit_cost'];
        $active = !empty($_POST['is_active']) ? 1 : 0;
        $pdo->prepare('UPDATE services SET credit_cost = ?, is_active = ? WHERE id = ?')->execute([$cost, $active, $sid]);
        $msg = 'Service updated.';
    } elseif ($action === 'delete') {
        $sid = (int)$_POST['service_id'];
        $used = (int)$pdo->query("SELECT COUNT(*) FROM requests WHERE service_id = {$sid}")->fetchColumn();
        if ($used > 0) {
            $pdo->prepare('UPDATE services SET is_active = 0 WHERE id = ?')->execute([$sid]);
            $msg = 'Service deactivated (has existing requests).';
        } else {
            $pdo->prepare('DELETE FROM services WHERE id = ?')->execute([$sid]);
            $msg = 'Service deleted.';
        }
    }
}

$services = $pdo->query('SELECT * FROM services ORDER BY sort_order ASC, id ASC')->fetchAll();
render_admin_header('Service Management', $admin, 'services');
?>
<?php if ($msg): ?><div class="alert alert-success small"><?= e($msg) ?></div><?php endif; ?>

<div class="card mb-4">
  <div class="card-header bg-navy text-white fw-bold">Add New Service</div>
  <div class="card-body">
    <form method="post" class="row g-2">
      <?= csrf_field() ?>
      <input type="hidden" name="action" value="create">
      <div class="col-md-3">
        <select name="category" class="form-select form-select-sm">
          <option value="NIDA SERVICES">NIDA SERVICES</option>
          <option value="DOCUMENT SERVICES">DOCUMENT SERVICES</option>
          <option value="TILL SERVICES">TILL SERVICES</option>
        </select>
      </div>
      <div class="col-md-3"><input type="text" name="name" class="form-control form-control-sm" placeholder="Service name" required></div>
      <div class="col-md-2"><input type="number" step="0.5" name="credit_cost" class="form-control form-control-sm" value="2" required></div>
      <div class="col-md-4"><input type="text" name="requirements_summary" class="form-control form-control-sm" placeholder="Requirements summary" required></div>
      <div class="col-md-10"><input type="text" name="description" class="form-control form-control-sm" placeholder="Service description" required></div>
      <div class="col-md-2"><button type="submit" class="btn btn-gold btn-sm w-100">Add Service</button></div>
    </form>
  </div>
</div>

<div class="card">
  <div class="table-responsive">
    <table class="table table-hover small mb-0">
      <thead class="table-light"><tr><th>Name</th><th>Category</th><th>Credit Cost</th><th>Active</th><th>Actions</th></tr></thead>
      <tbody>
        <?php foreach ($services as $s): ?>
          <tr>
            <td class="fw-semibold"><?= e($s['name']) ?></td>
            <td><?= e($s['category']) ?></td>
            <td colspan="2">
              <form method="post" class="d-flex gap-2 align-items-center">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="update">
                <input type="hidden" name="service_id" value="<?= (int)$s['id'] ?>">
                <input type="number" step="0.5" name="credit_cost" value="<?= e((string)$s['credit_cost']) ?>" class="form-control form-control-sm" style="width: 80px;">
                <label class="form-check-label small"><input type="checkbox" name="is_active" value="1" <?= (int)$s['is_active'] === 1 ? 'checked' : '' ?>> Active</label>
                <button class="btn btn-navy btn-sm" type="submit">Save</button>
              </form>
            </td>
            <td>
              <form method="post" onsubmit="return confirm('Delete or deactivate service?');">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="service_id" value="<?= (int)$s['id'] ?>">
                <button class="btn btn-outline-danger btn-sm" type="submit">Delete</button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php render_admin_footer(); ?>
