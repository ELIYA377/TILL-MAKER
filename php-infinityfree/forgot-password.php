<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';

$message = '';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $phone = normalize_phone((string)($_POST['phone'] ?? ''));
    if (!is_valid_phone($phone)) {
        $error = 'Please enter a valid registered phone number.';
    } else {
        $stmt = get_db()->prepare('SELECT id, full_name, phone FROM users WHERE phone = ? LIMIT 1');
        $stmt->execute([$phone]);
        $user = $stmt->fetch();
        if ($user) {
            create_notification(null, 1, 'password_reset_request', 'Password Reset Request', "{$user['full_name']} ({$user['phone']}) requested password reset.");
            log_activity('user', (int)$user['id'], $user['full_name'], 'PASSWORD_RESET_REQUEST', 'Submitted forgot password request');
        }
        $support = get_setting('support_phone', '0784615052');
        $message = "Your password reset request has been logged. Contact support at {$support} for verification.";
    }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Forgot Password — <?= e(APP_NAME) ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="assets/css/style.css" rel="stylesheet">
</head>
<body class="d-flex flex-column min-vh-100">
<nav class="navbar bg-navy navbar-dark py-3 px-4">
  <div class="container">
    <span class="navbar-brand fw-bold">DIGITAL SALES PRO MAX</span>
    <a href="login.php" class="btn btn-outline-light btn-sm">Back to Login</a>
  </div>
</nav>
<main class="flex-grow-1 d-flex align-items-center py-5">
  <div class="container" style="max-width: 460px;">
    <div class="card border shadow-sm">
      <div class="card-header bg-navy text-white py-3 fw-bold">Password Recovery</div>
      <div class="card-body p-4">
        <?php if ($error): ?><div class="alert alert-danger small"><?= e($error) ?></div><?php endif; ?>
        <?php if ($message): ?><div class="alert alert-success small"><?= e($message) ?></div><?php endif; ?>
        <form method="post" class="vstack gap-3">
          <?= csrf_field() ?>
          <div>
            <label class="form-label small fw-semibold">Registered Phone Number</label>
            <input type="tel" name="phone" class="form-control font-mono-num" required placeholder="07XXXXXXXX">
          </div>
          <button type="submit" class="btn btn-navy w-100">Request Password Reset</button>
        </form>
      </div>
    </div>
  </div>
</main>
<footer class="bg-white border-top py-3 text-center small text-muted"><?= e(FOOTER_TEXT) ?></footer>
</body>
</html>
