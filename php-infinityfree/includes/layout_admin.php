<?php
declare(strict_types=1);

function render_admin_header(string $title, array $admin, string $activePage = 'index'): void {
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($title) ?> — Admin · <?= e(APP_NAME) ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="../assets/css/style.css" rel="stylesheet">
</head>
<body>
<div class="d-flex flex-column flex-lg-row min-vh-100">
  <aside class="bg-navy text-white p-3 d-none d-lg-flex flex-column" style="width: 260px; flex-shrink: 0;">
    <div class="pb-3 mb-3 border-bottom border-secondary">
      <div class="fw-bold text-white">DIGITAL SALES PRO MAX</div>
      <div class="small text-gold fw-semibold">Admin Dashboard</div>
    </div>
    <nav class="nav flex-column gap-1 flex-grow-1">
      <a class="sidebar-link <?= $activePage === 'index' ? 'active' : '' ?>" href="index.php"><i class="bi bi-speedometer2"></i> Overview</a>
      <a class="sidebar-link <?= $activePage === 'requests' ? 'active' : '' ?>" href="requests.php"><i class="bi bi-clipboard-check"></i> Requests</a>
      <a class="sidebar-link <?= $activePage === 'users' ? 'active' : '' ?>" href="users.php"><i class="bi bi-people"></i> Users</a>
      <a class="sidebar-link <?= $activePage === 'services' ? 'active' : '' ?>" href="services.php"><i class="bi bi-briefcase"></i> Services</a>
      <a class="sidebar-link <?= $activePage === 'payments' ? 'active' : '' ?>" href="payments.php"><i class="bi bi-credit-card"></i> Payments</a>
      <a class="sidebar-link <?= $activePage === 'merchant' ? 'active' : '' ?>" href="merchant.php"><i class="bi bi-wallet2"></i> DSN Merchant Balance</a>
      <a class="sidebar-link <?= $activePage === 'withdrawals' ? 'active' : '' ?>" href="withdrawals.php"><i class="bi bi-cash-stack"></i> Withdraw Money</a>
      <a class="sidebar-link <?= $activePage === 'logs' ? 'active' : '' ?>" href="logs.php"><i class="bi bi-journal-text"></i> Reports &amp; Logs</a>
      <a class="sidebar-link <?= $activePage === 'settings' ? 'active' : '' ?>" href="settings.php"><i class="bi bi-gear"></i> Settings &amp; Backup</a>
    </nav>
    <div class="pt-3 border-top border-secondary">
      <a class="sidebar-link" href="../index.php"><i class="bi bi-arrow-left"></i> User Portal</a>
      <a class="sidebar-link text-danger" href="logout.php"><i class="bi bi-box-arrow-right"></i> Admin Logout</a>
    </div>
  </aside>

  <div class="flex-grow-1 d-flex flex-column">
    <header class="bg-white border-bottom px-3 px-lg-4 py-3 d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-dark btn-sm d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#adminMobileNav">
          <i class="bi bi-list"></i>
        </button>
        <span class="fw-bold"><?= e($title) ?></span>
      </div>
      <span class="small text-muted"><?= e($admin['full_name']) ?></span>
    </header>

    <div class="offcanvas offcanvas-start bg-navy text-white" id="adminMobileNav">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title fw-bold">Admin Console</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body d-flex flex-column gap-1">
        <a class="sidebar-link" href="index.php">Overview</a>
        <a class="sidebar-link" href="requests.php">Requests</a>
        <a class="sidebar-link" href="users.php">Users</a>
        <a class="sidebar-link" href="services.php">Services</a>
        <a class="sidebar-link" href="payments.php">Payments</a>
        <a class="sidebar-link" href="merchant.php">DSN Merchant Balance</a>
        <a class="sidebar-link" href="withdrawals.php">Withdraw Money</a>
        <a class="sidebar-link" href="logs.php">Reports &amp; Logs</a>
        <a class="sidebar-link" href="settings.php">Settings &amp; Backup</a>
        <a class="sidebar-link text-danger" href="logout.php">Logout</a>
      </div>
    </div>

    <main class="flex-grow-1 p-3 p-lg-4 container-fluid" style="max-width: 1320px;">
<?php
}

function render_admin_footer(): void {
?>
    </main>
    <footer class="bg-white border-top py-3 text-center small text-muted">
      <?= e(FOOTER_TEXT) ?>
    </footer>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
<?php
}
