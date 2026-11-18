<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/layout_user.php';

$user = require_user();
$cat = trim((string)($_GET['category'] ?? ''));

$pdo = get_db();
if ($cat !== '') {
    $stmt = $pdo->prepare('SELECT * FROM services WHERE is_active = 1 AND category = ? ORDER BY sort_order ASC, id ASC');
    $stmt->execute([$cat]);
} else {
    $stmt = $pdo->query('SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
}
$services = $stmt->fetchAll();

render_user_header('Available Services', $user, 'services');
?>
<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
  <div>
    <h4 class="fw-bold mb-1">Available Services</h4>
    <p class="small text-muted mb-0">Authorized NIDA, Document, and Mobile Money Till Services.</p>
  </div>
  <div class="btn-group btn-group-sm">
    <a href="services.php" class="btn <?= $cat === '' ? 'btn-navy' : 'btn-outline-secondary' ?>">All</a>
    <a href="services.php?category=NIDA+SERVICES" class="btn <?= $cat === 'NIDA SERVICES' ? 'btn-navy' : 'btn-outline-secondary' ?>">NIDA</a>
    <a href="services.php?category=DOCUMENT+SERVICES" class="btn <?= $cat === 'DOCUMENT SERVICES' ? 'btn-navy' : 'btn-outline-secondary' ?>">Documents</a>
    <a href="services.php?category=TILL+SERVICES" class="btn <?= $cat === 'TILL SERVICES' ? 'btn-navy' : 'btn-outline-secondary' ?>">Till</a>
  </div>
</div>

<div class="row g-3">
  <?php foreach ($services as $s): ?>
    <div class="col-md-6 col-lg-4">
      <div class="card h-100">
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <div class="small text-muted mb-1"><?= e($s['category']) ?> · <strong class="font-mono-num"><?= e((string)$s['credit_cost']) ?> Credits</strong></div>
            <h6 class="fw-bold"><?= e($s['name']) ?></h6>
            <p class="small text-muted"><?= e($s['description']) ?></p>
          </div>
          <a href="request-service.php?id=<?= (int)$s['id'] ?>" class="btn btn-navy btn-sm w-100 mt-2">Start Request</a>
        </div>
      </div>
    </div>
  <?php endforeach; ?>
</div>
<?php render_user_footer(); ?>
