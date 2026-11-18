<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/layout_user.php';

$user = require_user();
$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $curr = (string)($_POST['current_password'] ?? '');
    $new = (string)($_POST['new_password'] ?? '');
    $conf = (string)($_POST['confirm_password'] ?? '');

    $stmt = get_db()->prepare('SELECT password_hash FROM users WHERE id = ?');
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();

    if (!$row || !password_verify($curr, $row['password_hash'])) {
        $error = 'Current password is incorrect.';
    } elseif (strlen($new) < 4 || $new !== $conf) {
        $error = 'New passwords must match and be at least 4 characters.';
    } else {
        $hash = password_hash($new, PASSWORD_DEFAULT);
        get_db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$hash, $user['id']]);
        log_activity('user', (int)$user['id'], $user['full_name'], 'PASSWORD_CHANGED', 'User updated password');
        $success = 'Password updated successfully.';
    }
}

render_user_header('Profile Settings', $user, 'profile');
?>
<div class="row g-4">
  <div class="col-md-6">
    <div class="card p-4">
      <h5 class="fw-bold mb-3">Account Information</h5>
      <div class="mb-2"><small class="text-muted">Full Name</small><div class="fw-bold"><?= e($user['full_name']) ?></div></div>
      <div class="mb-2"><small class="text-muted">Phone Number</small><div class="fw-bold font-mono-num"><?= e($user['phone']) ?></div></div>
      <div class="mb-3"><small class="text-muted">Available Credits</small><div class="fw-bold font-mono-num"><?= number_format((float)$user['credit_balance'], 2) ?></div></div>
      <a href="logout.php" class="btn btn-outline-danger btn-sm">LOGOUT</a>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card p-4">
      <h5 class="fw-bold mb-3">Change Password</h5>
      <?php if ($error): ?><div class="alert alert-danger small"><?= e($error) ?></div><?php endif; ?>
      <?php if ($success): ?><div class="alert alert-success small"><?= e($success) ?></div><?php endif; ?>
      <form method="post" class="vstack gap-3">
        <?= csrf_field() ?>
        <div><label class="form-label small fw-semibold">Current Password</label><input type="password" name="current_password" class="form-control" required></div>
        <div><label class="form-label small fw-semibold">New Password</label><input type="password" name="new_password" class="form-control" required minlength="4"></div>
        <div><label class="form-label small fw-semibold">Confirm New Password</label><input type="password" name="confirm_password" class="form-control" required minlength="4"></div>
        <button type="submit" class="btn btn-navy">Update Password</button>
      </form>
    </div>
  </div>
</div>
<?php render_user_footer(); ?>
