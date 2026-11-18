<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/layout_admin.php';

$admin = require_admin();
$pdo = get_db();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $upd = $pdo->prepare('UPDATE system_settings SET setting_value = ? WHERE setting_key = ?');
    $upd->execute([trim((string)$_POST['credit_rate_tzs']), 'credit_rate_tzs']);
    $upd->execute([trim((string)$_POST['default_request_cost']), 'default_request_cost']);
    $upd->execute([trim((string)$_POST['dsn_user_id']), 'dsn_user_id']);
    $upd->execute([normalize_phone((string)$_POST['support_phone']), 'support_phone']);
    if (!empty($_POST['new_admin_password']) && strlen((string)$_POST['new_admin_password']) >= 6) {
        $pdo->prepare('UPDATE admins SET password_hash = ? WHERE id = ?')->execute([password_hash((string)$_POST['new_admin_password'], PASSWORD_DEFAULT), $admin['id']]);
    }
    $msg = 'Settings updated.';
}

render_admin_header('Settings & Backup', $admin, 'settings');
?>
<?php if ($msg): ?><div class="alert alert-success small"><?= e($msg) ?></div><?php endif; ?>
<div class="row g-4">
  <div class="col-lg-6">
    <div class="card p-4">
      <h6 class="fw-bold mb-3">System &amp; Credit Rate Settings</h6>
      <form method="post" class="vstack gap-3">
        <?= csrf_field() ?>
        <div><label class="form-label small fw-semibold">Credit Conversion Rate (TSh / 1 Credit)</label><input type="number" name="credit_rate_tzs" class="form-control font-mono-num" value="<?= e(get_setting('credit_rate_tzs', '500')) ?>"></div>
        <div><label class="form-label small fw-semibold">Default Request Credit Cost</label><input type="number" step="0.5" name="default_request_cost" class="form-control font-mono-num" value="<?= e(get_setting('default_request_cost', '2')) ?>"></div>
        <div><label class="form-label small fw-semibold">DSN User ID</label><input type="text" name="dsn_user_id" class="form-control font-mono-num" value="<?= e(get_setting('dsn_user_id', 'DSN-0036')) ?>"></div>
        <div><label class="form-label small fw-semibold">Support Phone</label><input type="tel" name="support_phone" class="form-control font-mono-num" value="<?= e(get_setting('support_phone', '0784615052')) ?>"></div>
        <div><label class="form-label small fw-semibold">New Admin Password (Optional)</label><input type="password" name="new_admin_password" class="form-control"></div>
        <button type="submit" class="btn btn-navy">Save Settings</button>
      </form>
    </div>
  </div>
  <div class="col-lg-6">
    <div class="card p-4">
      <h6 class="fw-bold mb-2">Backup Management</h6>
      <p class="small text-muted">Export all 15 MySQL tables as JSON backup.</p>
      <a href="backup.php" class="btn btn-gold">Download Database Backup</a>
    </div>
  </div>
</div>
<?php render_admin_footer(); ?>
