<?php
declare(strict_types=1);

$lockFile = __DIR__ . '/config/installed.lock';
if (file_exists($lockFile)) {
    die('DIGITAL SALES PRO MAX is already installed. Remove config/installed.lock only if you intentionally need to re-run installation.');
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dbHost = trim((string)($_POST['db_host'] ?? ''));
    $dbName = trim((string)($_POST['db_name'] ?? ''));
    $dbUser = trim((string)($_POST['db_user'] ?? ''));
    $dbPass = (string)($_POST['db_pass'] ?? '');
    $dsnKey = trim((string)($_POST['dsn_api_key'] ?? ''));
    $dsnUser = trim((string)($_POST['dsn_user_id'] ?? 'DSN-0036'));
    $adminName = trim((string)($_POST['admin_name'] ?? 'Digital Sales Super Admin'));
    $adminUsername = trim((string)($_POST['admin_username'] ?? 'admin'));
    $adminPhone = preg_replace('/\D+/', '', (string)($_POST['admin_phone'] ?? '0784615052'));
    $adminPass = (string)($_POST['admin_password'] ?? '');

    if (!$dbHost || !$dbName || !$dbUser || strlen($adminPass) < 6) {
        $error = 'Please fill all database fields and use an admin password of at least 6 characters.';
    } else {
        try {
            $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $dbHost, $dbName);
            $pdo = new PDO($dsn, $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ]);

            $schemaSql = file_get_contents(__DIR__ . '/database/schema.sql');
            if ($schemaSql === false) {
                throw new RuntimeException('Could not read database/schema.sql');
            }

            // Execute SQL statements cleanly
            $statements = array_filter(array_map('trim', explode(";\n", str_replace("\r\n", "\n", $schemaSql))));
            foreach ($statements as $sql) {
                if ($sql !== '' && !str_starts_with($sql, '--')) {
                    $pdo->exec($sql);
                }
            }

            // Create initial admin account using PHP password_hash()
            $hash = password_hash($adminPass, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('INSERT INTO admins (full_name, username, phone, password_hash, role, is_active) VALUES (?, ?, ?, ?, "super_admin", 1) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), full_name = VALUES(full_name)');
            $stmt->execute([$adminName, $adminUsername, $adminPhone, $hash]);

            // Save config.local.php
            $configPhp = "<?php\n"
                . "define('DB_HOST', " . var_export($dbHost, true) . ");\n"
                . "define('DB_NAME', " . var_export($dbName, true) . ");\n"
                . "define('DB_USER', " . var_export($dbUser, true) . ");\n"
                . "define('DB_PASS', " . var_export($dbPass, true) . ");\n"
                . "define('DSN_API_KEY', " . var_export($dsnKey, true) . ");\n"
                . "define('DSN_USER_ID', " . var_export($dsnUser ?: 'DSN-0036', true) . ");\n";
            file_put_contents(__DIR__ . '/config/config.local.php', $configPhp);
            file_put_contents($lockFile, 'Installed on ' . date('c'));

            $success = 'Installation completed successfully! All 15 MySQL tables and initial Admin account are ready.';
        } catch (Throwable $e) {
            $error = 'Installation failed: ' . $e->getMessage();
        }
    }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Install — DIGITAL SALES PRO MAX</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="assets/css/style.css" rel="stylesheet">
</head>
<body class="bg-light">
<nav class="navbar bg-navy navbar-dark py-3">
  <div class="container">
    <span class="navbar-brand fw-bold">DIGITAL SALES PRO MAX — InfinityFree Installer</span>
  </div>
</nav>
<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-lg-7">
      <div class="card border shadow-sm">
        <div class="card-header bg-navy text-white fw-bold py-3">
          Database, DSN Payment &amp; Admin Account Setup
        </div>
        <div class="card-body p-4">
          <?php if ($error): ?>
            <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
          <?php endif; ?>
          <?php if ($success): ?>
            <div class="alert alert-success">
              <strong><?= htmlspecialchars($success) ?></strong>
              <div class="mt-3 d-flex gap-2">
                <a href="index.php" class="btn btn-navy btn-sm">Open User Portal</a>
                <a href="admin/index.php" class="btn btn-gold btn-sm">Open Admin Portal</a>
              </div>
            </div>
          <?php else: ?>
            <form method="post" class="row g-3">
              <div class="col-12"><h6 class="fw-bold border-bottom pb-2">1. InfinityFree MySQL Database</h6></div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">MySQL Hostname</label>
                <input type="text" name="db_host" class="form-control" required placeholder="sqlXXX.infinityfree.com">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Database Name</label>
                <input type="text" name="db_name" class="form-control" required placeholder="if0_xxxxxxxx_digitalsales">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">MySQL Username</label>
                <input type="text" name="db_user" class="form-control" required placeholder="if0_xxxxxxxx">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">MySQL Password</label>
                <input type="password" name="db_pass" class="form-control">
              </div>

              <div class="col-12 mt-4"><h6 class="fw-bold border-bottom pb-2">2. DSN Technology Payment API</h6></div>
              <div class="col-md-8">
                <label class="form-label small fw-semibold">DSN X-API-Key (Server-side only)</label>
                <input type="password" name="dsn_api_key" class="form-control" placeholder="Enter your live DSN Technology X-API-Key">
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">DSN User ID</label>
                <input type="text" name="dsn_user_id" class="form-control" value="DSN-0036" required>
              </div>

              <div class="col-12 mt-4"><h6 class="fw-bold border-bottom pb-2">3. Initial Admin Account</h6></div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Admin Full Name</label>
                <input type="text" name="admin_name" class="form-control" value="Digital Sales Super Admin" required>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Admin Username</label>
                <input type="text" name="admin_username" class="form-control" value="admin" required>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Admin Phone</label>
                <input type="text" name="admin_phone" class="form-control" value="0784615052" required>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Admin Password (Min 6 chars)</label>
                <input type="password" name="admin_password" class="form-control" required minlength="6">
              </div>

              <div class="col-12 mt-4">
                <button type="submit" class="btn btn-gold w-100 py-2">Install Database &amp; Create Admin</button>
              </div>
            </form>
          <?php endif; ?>
        </div>
      </div>
    </div>
  </div>
</div>
<footer class="text-center py-3 border-top bg-white small text-muted mt-5">
  Developed by Digital Sales
</footer>
</body>
</html>
