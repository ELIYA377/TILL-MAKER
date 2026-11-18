<?php
declare(strict_types=1);

function render_user_header(string $title, array $user, string $activePage = 'dashboard'): void {
    $creditBalance = number_format((float)$user['credit_balance'], 2);
    $stmt = get_db()->prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 10');
    $stmt->execute([$user['id']]);
    $notifs = $stmt->fetchAll();
    $unread = 0;
    foreach ($notifs as $n) {
        if ((int)$n['is_read'] === 0) $unread++;
    }
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($title) ?> — <?= e(APP_NAME) ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="assets/css/style.css" rel="stylesheet">
</head>
<body>
<div class="d-flex flex-column flex-lg-row min-vh-100">
  <aside class="bg-navy text-white p-3 d-none d-lg-flex flex-column" style="width: 260px; flex-shrink: 0;">
    <div class="pb-3 mb-3 border-bottom border-secondary">
      <div class="fw-bold text-white">DIGITAL SALES PRO MAX</div>
      <div class="small text-gold fw-semibold mt-1 font-mono-num"><?= $creditBalance ?> Credits</div>
      <a href="buy-credits.php" class="btn btn-gold btn-sm w-100 mt-2">BUY CREDITS</a>
    </div>
    <nav class="nav flex-column gap-1 flex-grow-1">
      <a class="sidebar-link <?= $activePage === 'dashboard' ? 'active' : '' ?>" href="dashboard.php"><i class="bi bi-speedometer2"></i> Dashboard</a>
      <a class="sidebar-link <?= $activePage === 'services' ? 'active' : '' ?>" href="services.php"><i class="bi bi-briefcase"></i> New Request</a>
      <a class="sidebar-link <?= $activePage === 'requests' ? 'active' : '' ?>" href="my-requests.php"><i class="bi bi-list-check"></i> My Requests</a>
      <a class="sidebar-link <?= $activePage === 'completed' ? 'active' : '' ?>" href="my-requests.php?status=Completed"><i class="bi bi-file-earmark-check"></i> Completed Requests</a>
      <a class="sidebar-link <?= $activePage === 'buy-credits' ? 'active' : '' ?>" href="buy-credits.php"><i class="bi bi-credit-card"></i> Buy Credits</a>
      <a class="sidebar-link <?= $activePage === 'payments' ? 'active' : '' ?>" href="transactions.php?tab=payments"><i class="bi bi-cash-coin"></i> Payment History</a>
      <a class="sidebar-link <?= $activePage === 'credits' ? 'active' : '' ?>" href="transactions.php?tab=credits"><i class="bi bi-clock-history"></i> Credit History</a>
      <a class="sidebar-link <?= $activePage === 'profile' ? 'active' : '' ?>" href="profile.php"><i class="bi bi-person-gear"></i> Profile Settings</a>
    </nav>
    <div class="pt-3 border-top border-secondary">
      <a class="sidebar-link text-danger" href="logout.php"><i class="bi bi-box-arrow-right"></i> Logout</a>
    </div>
  </aside>

  <div class="flex-grow-1 d-flex flex-column">
    <header class="bg-white border-bottom px-3 px-lg-4 py-3 d-flex align-items-center justify-content-between">
      <div>
        <button class="btn btn-outline-dark btn-sm d-lg-none me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNav">
          <i class="bi bi-list"></i>
        </button>
        <span class="fw-bold"><?= e($user['full_name']) ?></span>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-navy text-gold font-mono-num px-3 py-2"><?= $creditBalance ?> Credits</span>
        <div class="dropdown">
          <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
            <i class="bi bi-bell"></i> (<?= $unread ?>)
          </button>
          <div class="dropdown-menu dropdown-menu-end p-2" style="width: 300px; max-height: 320px; overflow-y: auto;">
            <?php if (!$notifs): ?>
              <div class="small text-muted p-2">No notifications.</div>
            <?php else: foreach ($notifs as $n): ?>
              <div class="border-bottom py-2 small">
                <div class="fw-bold"><?= e($n['title']) ?></div>
                <div class="text-muted"><?= e($n['message']) ?></div>
              </div>
            <?php endforeach; endif; ?>
          </div>
        </div>
        <a href="services.php" class="btn btn-navy btn-sm d-none d-sm-inline-block">NEW REQUEST</a>
      </div>
    </header>

    <div class="offcanvas offcanvas-start bg-navy text-white" id="mobileNav">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title fw-bold">DIGITAL SALES PRO MAX</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body d-flex flex-column gap-1">
        <a class="sidebar-link" href="dashboard.php">Dashboard</a>
        <a class="sidebar-link" href="services.php">New Request</a>
        <a class="sidebar-link" href="my-requests.php">My Requests</a>
        <a class="sidebar-link" href="buy-credits.php">Buy Credits</a>
        <a class="sidebar-link" href="transactions.php?tab=payments">Payment History</a>
        <a class="sidebar-link" href="transactions.php?tab=credits">Credit History</a>
        <a class="sidebar-link" href="profile.php">Profile Settings</a>
        <a class="sidebar-link text-danger" href="logout.php">Logout</a>
      </div>
    </div>

    <main class="flex-grow-1 p-3 p-lg-4 container-fluid" style="max-width: 1200px;">
<?php
}

function render_user_footer(): void {
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
