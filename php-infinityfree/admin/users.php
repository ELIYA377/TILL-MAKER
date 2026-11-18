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
    $userId = (int)($_POST['user_id'] ?? 0);

    if ($action === 'toggle_status') {
        $next = ($_POST['status'] ?? '') === 'suspended' ? 'suspended' : 'active';
        $pdo->prepare('UPDATE users SET status = ? WHERE id = ?')->execute([$next, $userId]);
        $msg = "User status updated to {$next}.";
    } elseif ($action === 'add_credits') {
        $amt = (float)($_POST['credits'] ?? 0);
        if ($amt > 0) {
            $pdo->beginTransaction();
            $u = $pdo->prepare('SELECT credit_balance FROM users WHERE id = ? FOR UPDATE');
            $u->execute([$userId]);
            $bal = (float)$u->fetchColumn();
            $newBal = round($bal + $amt, 2);
            $pdo->prepare('UPDATE users SET credit_balance = ? WHERE id = ?')->execute([$newBal, $userId]);
            $pdo->prepare('INSERT INTO credit_transactions (user_id, type, credits, balance_before, balance_after, reference_code, description) VALUES (?, "admin_add", ?, ?, ?, ?, ?)')
                ->execute([$userId, $amt, $bal, $newBal, 'ADM-' . time(), 'Admin credit addition']);
            $pdo->commit();
            create_notification($userId, 0, 'credit_added', 'Credits Added', "{$amt} credits added by Admin. Balance: {$newBal}.");
            $msg = "Added {$amt} credits.";
        }
    } elseif ($action === 'delete') {
        $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$userId]);
        $msg = 'User deleted.';
    }
}

$q = trim((string)($_GET['q'] ?? ''));
if ($q !== '') {
    $stmt = $pdo->prepare('SELECT * FROM users WHERE full_name LIKE ? OR phone LIKE ? ORDER BY id DESC');
    $stmt->execute(["%{$q}%", "%{$q}%"]);
    $users = $stmt->fetchAll();
} else {
    $users = $pdo->query('SELECT * FROM users ORDER BY id DESC')->fetchAll();
}

render_admin_header('User Management', $admin, 'users');
?>
<?php if ($msg): ?><div class="alert alert-success small"><?= e($msg) ?></div><?php endif; ?>
<form class="mb-3 d-flex gap-2" method="get" style="max-width: 400px;">
  <input type="text" name="q" class="form-control form-control-sm" value="<?= e($q) ?>" placeholder="Search name or phone...">
  <button class="btn btn-navy btn-sm" type="submit">Search</button>
</form>

<div class="card">
  <div class="table-responsive">
    <table class="table table-hover small mb-0">
      <thead class="table-light"><tr><th>Name</th><th>Phone</th><th>Credits</th><th>Status</th><th>Add Credits</th><th>Actions</th></tr></thead>
      <tbody>
        <?php foreach ($users as $u): ?>
          <tr>
            <td class="fw-semibold"><?= e($u['full_name']) ?></td>
            <td class="font-mono-num"><?= e($u['phone']) ?></td>
            <td class="font-mono-num fw-bold"><?= number_format((float)$u['credit_balance'], 2) ?></td>
            <td><?= e($u['status']) ?></td>
            <td>
              <form method="post" class="d-flex gap-1">
                <?= csrf_field() ?>
                <input type="hidden" name="user_id" value="<?= (int)$u['id'] ?>">
                <input type="hidden" name="action" value="add_credits">
                <input type="number" name="credits" step="0.5" min="0.5" value="2" class="form-control form-control-sm" style="width: 75px;">
                <button class="btn btn-gold btn-sm" type="submit">+Add</button>
              </form>
            </td>
            <td class="d-flex gap-1">
              <form method="post">
                <?= csrf_field() ?>
                <input type="hidden" name="user_id" value="<?= (int)$u['id'] ?>">
                <input type="hidden" name="action" value="toggle_status">
                <input type="hidden" name="status" value="<?= $u['status'] === 'active' ? 'suspended' : 'active' ?>">
                <button class="btn btn-outline-secondary btn-sm" type="submit"><?= $u['status'] === 'active' ? 'Suspend' : 'Activate' ?></button>
              </form>
              <form method="post" onsubmit="return confirm('Delete this user permanently?');">
                <?= csrf_field() ?>
                <input type="hidden" name="user_id" value="<?= (int)$u['id'] ?>">
                <input type="hidden" name="action" value="delete">
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
