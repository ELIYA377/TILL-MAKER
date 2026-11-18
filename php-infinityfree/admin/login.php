<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/auth.php';

if (current_admin()) {
    header('Location: index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $ident = trim((string)($_POST['identifier'] ?? ''));
    $phone = normalize_phone($ident);
    $pass = (string)($_POST['password'] ?? '');

    $stmt = get_db()->prepare('SELECT * FROM admins WHERE username = ? OR phone = ? LIMIT 1');
    $stmt->execute([$ident, $phone]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($pass, $admin['password_hash'])) {
        $error = 'Invalid admin credentials.';
    } elseif ((int)$admin['is_active'] !== 1) {
        $error = 'Admin account disabled.';
    } else {
        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int)$admin['id'];
        get_db()->prepare('UPDATE admins SET last_login_at = NOW() WHERE id = ?')->execute([$admin['id']]);
        log_activity('admin', (int)$admin['id'], $admin['full_name'], 'ADMIN_LOGIN', 'Admin logged in');
        header('Location: index.php');
        exit;
    }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Admin Login — <?= e(APP_NAME) ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="../assets/css/style.css" rel="stylesheet">
</head>
<body class="d-flex flex-column min-vh-100">
<nav class="navbar bg-navy navbar-dark py-3 px-4">
  <div class="container">
    <span class="navbar-brand fw-bold">DIGITAL SALES PRO MAX · Admin</span>
    <a href="../index.php" class="btn btn-outline-light btn-sm">User Portal</a>
  </div>
</nav>
<main class="flex-grow-1 d-flex align-items-center py-5">
  <div class="container" style="max-width: 440px;">
    <div class="card border shadow-sm">
      <div class="card-header bg-navy text-white fw-bold py-3">Administrator Login</div>
      <div class="card-body p-4">
        <?php if ($error): ?><div class="alert alert-danger small"><?= e($error) ?></div><?php endif; ?>
        <form method="post" class="vstack gap-3">
          <?= csrf_field() ?>
          <div><label class="form-label small fw-semibold">Username or Phone</label><input type="text" name="identifier" class="form-control" required></div>
          <div><label class="form-label small fw-semibold">Password</label><input type="password" name="password" class="form-control" required></div>
          <button type="submit" class="btn btn-navy w-100 py-2">Sign In</button>
        </form>
      </div>
    </div>
  </div>
</main>
<footer class="bg-white border-top py-3 text-center small text-muted"><?= e(FOOTER_TEXT) ?></footer>
</body>
</html>
