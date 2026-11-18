<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';

if (current_user()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $phone = normalize_phone((string)($_POST['phone'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if (!$phone || !$password) {
        $error = 'Phone number and password are required.';
    } else {
        $candidates = phone_candidates((string)($_POST['phone'] ?? ''));
        $placeholders = implode(',', array_fill(0, max(1, count($candidates)), '?'));
        $stmt = get_db()->prepare("SELECT * FROM users WHERE phone IN ({$placeholders}) LIMIT 1");
        $stmt->execute($candidates ?: [$phone]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) {
            log_activity('user', null, $phone ?: 'unknown', 'USER_LOGIN_FAILED', 'Invalid credentials');
            $error = 'Invalid phone number or password.';
        } elseif ($user['status'] !== 'active') {
            $error = 'Your account is suspended. Contact support for assistance.';
        } else {
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int)$user['id'];
            log_activity('user', (int)$user['id'], $user['full_name'], 'USER_LOGIN', 'User signed in');
            header('Location: dashboard.php');
            exit;
        }
    }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login — <?= e(APP_NAME) ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="assets/css/style.css" rel="stylesheet">
</head>
<body class="d-flex flex-column min-vh-100">
<nav class="navbar bg-navy navbar-dark py-3 px-4">
  <div class="container">
    <span class="navbar-brand fw-bold">DIGITAL SALES PRO MAX</span>
    <div class="d-flex gap-2">
      <a href="register.php" class="btn btn-gold btn-sm">REGISTER HERE</a>
      <a href="admin/login.php" class="btn btn-outline-light btn-sm">Admin</a>
    </div>
  </div>
</nav>
<main class="flex-grow-1 d-flex align-items-center py-5">
  <div class="container" style="max-width: 480px;">
    <div class="card border shadow-sm">
      <div class="card-header bg-navy text-white py-3 fw-bold">User Login</div>
      <div class="card-body p-4">
        <?php if ($error): ?>
          <div class="alert alert-danger small"><?= e($error) ?></div>
        <?php endif; ?>
        <form method="post" class="vstack gap-3">
          <?= csrf_field() ?>
          <div>
            <label class="form-label small fw-semibold">Phone Number</label>
            <input type="tel" name="phone" class="form-control font-mono-num" required placeholder="07XXXXXXXX">
          </div>
          <div>
            <div class="d-flex justify-content-between">
              <label class="form-label small fw-semibold">Password</label>
              <a href="forgot-password.php" class="small text-decoration-none">Forgot Password?</a>
            </div>
            <input type="password" name="password" class="form-control" required>
          </div>
          <button type="submit" class="btn btn-navy w-100 py-2 fw-semibold">Login</button>
        </form>
        <hr class="my-4">
        <div class="text-center">
          <p class="small text-muted mb-2">Don't have an account?</p>
          <a href="register.php" class="btn btn-gold w-100">REGISTER HERE — Create New Account</a>
        </div>
      </div>
    </div>
  </div>
</main>
<footer class="bg-white border-top py-3 text-center small text-muted"><?= e(FOOTER_TEXT) ?></footer>
</body>
</html>
