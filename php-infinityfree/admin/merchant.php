<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/dsn_api.php';
require_once dirname(__DIR__) . '/includes/layout_admin.php';

$admin = require_admin();
$bal = dsn_fetch_merchant_balance((int)$admin['id']);
$logs = get_db()->query('SELECT * FROM merchant_balance_logs ORDER BY id DESC LIMIT 15')->fetchAll();

render_admin_header('DSN Merchant Balance', $admin, 'merchant');
?>
<div class="card bg-navy text-white mb-4 border-0">
  <div class="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
    <div>
      <div class="small text-gold fw-semibold">DSN Technology · <?= e(get_setting('dsn_user_id', DSN_USER_ID)) ?></div>
      <h5 class="fw-bold mb-0">Live Merchant Balance</h5>
      <div class="small text-light">Last Updated: <?= date('Y-m-d H:i:s') ?> · Status: <strong><?= e($bal['status']) ?></strong></div>
    </div>
    <a href="merchant.php" class="btn btn-gold btn-sm">Refresh Balance</a>
  </div>
</div>

<?php if (!$bal['ok']): ?>
  <div class="alert alert-warning small"><?= e($bal['message']) ?></div>
<?php endif; ?>

<div class="row g-3 mb-4">
  <?php
  $cards = [
    ['Available Balance', $bal['available_balance']],
    ['Pending Funds', $bal['pending_funds']],
    ['Reserved for Withdrawals', $bal['reserved_withdrawals']],
    ['Total Collected', $bal['total_collected']],
    ['Total Collection Fees', $bal['total_collection_fees']],
    ['Total Net Earnings', $bal['total_net_earnings']],
  ];
  foreach ($cards as [$label, $val]): ?>
    <div class="col-md-4">
      <div class="card p-3">
        <div class="small text-muted"><?= e($label) ?></div>
        <div class="h5 fw-bold font-mono-num mb-0"><?= $val === null ? '—' : 'TSh ' . number_format((float)$val) ?></div>
      </div>
    </div>
  <?php endforeach; ?>
</div>

<div class="card">
  <div class="card-header bg-white fw-bold">Balance Check Logs</div>
  <div class="table-responsive">
    <table class="table table-sm small mb-0">
      <thead class="table-light"><tr><th>Checked At</th><th>Status</th><th>Available</th><th>Net Earnings</th></tr></thead>
      <tbody>
        <?php foreach ($logs as $l): ?>
          <tr>
            <td class="font-mono-num"><?= e((string)$l['created_at']) ?></td>
            <td><?= e($l['api_status']) ?></td>
            <td class="font-mono-num"><?= $l['available_balance'] === null ? '—' : 'TSh ' . number_format((float)$l['available_balance']) ?></td>
            <td class="font-mono-num"><?= $l['total_net_earnings'] === null ? '—' : 'TSh ' . number_format((float)$l['total_net_earnings']) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php render_admin_footer(); ?>
