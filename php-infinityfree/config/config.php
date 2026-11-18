<?php
declare(strict_types=1);

// Load local configuration created by install.php or environment variables
$localConfig = __DIR__ . '/config.local.php';
if (file_exists($localConfig)) {
    require_once $localConfig;
}

if (!defined('DB_HOST')) define('DB_HOST', getenv('DB_HOST') ?: 'sqlXXX.infinityfree.com');
if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: 'if0_xxxxxxxx_digitalsales');
if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: 'if0_xxxxxxxx');
if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASS') ?: '');

// Server-side DSN Technology API Credentials (NEVER expose in HTML or JS)
if (!defined('DSN_API_KEY')) define('DSN_API_KEY', getenv('DSN_API_KEY') ?: '');
if (!defined('DSN_USER_ID')) define('DSN_USER_ID', getenv('DSN_USER_ID') ?: 'DSN-0036');
if (!defined('DSN_BASE_URL')) define('DSN_BASE_URL', 'https://dsntechnology.co.tz/api/v1');

if (!defined('APP_NAME')) define('APP_NAME', 'DIGITAL SALES PRO MAX');
if (!defined('FOOTER_TEXT')) define('FOOTER_TEXT', 'Developed by Digital Sales');
if (!defined('UPLOAD_ROOT')) define('UPLOAD_ROOT', dirname(__DIR__) . '/uploads');

if (!is_dir(UPLOAD_ROOT)) {
    @mkdir(UPLOAD_ROOT, 0750, true);
}
