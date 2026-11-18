<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
if (current_user()) {
    header('Location: dashboard.php');
    exit;
}
header('Location: login.php');
exit;
