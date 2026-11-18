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
    $fullName = trim((string)preg_replace('/\s+/', ' ', (string)($_POST['full_name'] ?? '')));
    $phone = normalize_phone((string)($_POST['phone'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if (!validate_three_names($fullName)) {
        $error = 'Please enter your full three names (First, Middle, and Last name).';
    } elseif (!is_valid_phone($phone)) {
        $error = 'Please enter a valid mobile phone number.';
    } elseif (strlen($password) < 4) {
        $error = 'Password must be at least 4 characters or digits.';
    } else {
        $pdo = get_db();
        $candidates = phone_candidates((string)($_POST['phone'] ?? ''));
        $placeholders = implode(',', array_fill(0, max(1, count($candidates)), '?'));
        $check = $pdo->prepare("SELECT id FROM users WHERE phone IN ({$placeholders}) LIMIT 1");
        $check->execute($candidates ?: [$phone]);
        if ($check->fetch()) {
            $error = 'This phone number is already registered. Please log in.';
        } else {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $ins = $pdo->prepare('INSERT INTO users (full_name, phone, password_hash, credit_balance, status) VALUES (?, ?, ?, 0.00, "active")');
            $ins->execute([$fullName, $phone, $hash]);
            $userId = (int)$pdo->lastInsertId();

            create_notification($userId, 0, 'registration', 'Welcome to DIGITAL SALES PRO MAX', "Account registered for {$fullName} ({$phone}).");
            create_notification(null, 1, 'new_user', 'New User Registered', "{$fullName} ({$phone}) registered.");
            log_activity('user', $userId, "{$fullName} ({$phone})", 'USER_REGISTER', 'Independent registration completed');

            session_regenerate_id(true);
            $_SESSION['user_id'] = $userId;
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
  <title>Register — <?= e(APP_NAME) ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="assets/css/style.css" rel="stylesheet">
</head>
<body class="d-flex flex-column min-vh-100">
<nav class="navbar bg-navy navbar-dark py-3 px-4">
  <div class="container">
    <span class="navbar-brand fw-bold">DIGITAL SALES PRO MAX</span>
    <a href="login.php" class="btn btn-outline-light btn-sm">Login</a>
  </div>
</nav>
<main class="flex-grow-1 d-flex align-items-center py-5">
  <div class="container" style="max-width: 500px;">
    <div class="card border shadow-sm">
      <div class="card-header bg-navy text-white py-3 fw-bold">Create New Account</div>
      <div class="card-body p-4">
        <p class="small text-muted mb-3">No email required. Complete the three fields below.</p>
        <?php if ($error): ?>
          <div class="alert alert-danger small"><?= e($error) ?></div>
        <?php endif; ?>
        <form method="post" class="vstack gap-3">
          <?= csrf_field() ?>
          <div>
            <label class="form-label small fw-semibold">1. Full Name (Three Names)</label>
            <input type="text" name="full_name" class="form-control" required placeholder="First Middle Last Name">
          </div>
          <div>
            <label class="form-label small fw-semibold">2. Phone Number</label>
            <input type="tel" name="phone" class="form-control font-mono-num" required placeholder="07XXXXXXXX">
          </div>
          <div>
            <label class="form-label small fw-semibold">3. Password (Minimum 4 characters or digits)</label>
            <input type="password" name="password" class="form-control" required minlength="4">
          </div>
          <button type="submit" class="btn btn-gold w-100 py-2">Create New Account</button>
        </form>
        <div class="text-center mt-3 small">
          Already have an account? <a href="login.php" class="fw-semibold">Login Here</a>
        </div>
      </div>
    </div>
  </div>
</main>
<footer class="bg-white border-top py-3 text-center small text-muted"><?= e(FOOTER_TEXT) ?></footer>
</body>
</html>
