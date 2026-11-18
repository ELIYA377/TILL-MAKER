<?php
declare(strict_types=1);

require_once __DIR__ . '/security.php';

function current_user(): ?array {
    start_secure_session();
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    $stmt = get_db()->prepare('SELECT id, full_name, phone, credit_balance, status, created_at FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([(int)$_SESSION['user_id']]);
    $user = $stmt->fetch();
    if (!$user || $user['status'] !== 'active') {
        unset($_SESSION['user_id']);
        return null;
    }
    return $user;
}

function require_user(): array {
    $user = current_user();
    if (!$user) {
        header('Location: login.php');
        exit;
    }
    return $user;
}

function current_admin(): ?array {
    start_secure_session();
    if (empty($_SESSION['admin_id'])) {
        return null;
    }
    $stmt = get_db()->prepare('SELECT id, full_name, username, phone, role, is_active FROM admins WHERE id = ? LIMIT 1');
    $stmt->execute([(int)$_SESSION['admin_id']]);
    $admin = $stmt->fetch();
    if (!$admin || (int)$admin['is_active'] !== 1) {
        unset($_SESSION['admin_id']);
        return null;
    }
    return $admin;
}

function require_admin(): array {
    $admin = current_admin();
    if (!$admin) {
        header('Location: login.php');
        exit;
    }
    return $admin;
}
