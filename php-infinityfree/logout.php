<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
start_secure_session();
unset($_SESSION['user_id']);
header('Location: login.php');
exit;
