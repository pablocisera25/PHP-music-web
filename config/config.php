<?php

require __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

$env = $_ENV['APP_ENV'] ?? 'dev';

if ($env === 'dev') {
    $dbPath = $_ENV['DB_DATABASE'];

    // Si tiene APP_BASE_PATH lo resolvemos (por si hay una ruta relativa)
    if (str_starts_with($dbPath, '${APP_BASE_PATH}')) {
        $dbPath = str_replace('${APP_BASE_PATH}', $_ENV['APP_BASE_PATH'], $dbPath);
    }

    $dbConfig = [
        'driver' => $_ENV['DB_DRIVER'],
        'database' => $dbPath,
    ];
} else {
    $dbConfig = [
        'driver' => $_ENV['DB_DRIVER'],
        'host' => $_ENV['DB_HOST'],
        'port' => $_ENV['DB_PORT'],
        'database' => $_ENV['DB_DATABASE'],
        'username' => $_ENV['DB_USERNAME'],
        'password' => $_ENV['DB_PASSWORD']
    ];
}

$API_KEY=$_ENV['API_KEY'];

return [
    'env' => $env,
    'db_config' => $dbConfig,
    'API_KEY'=>$API_KEY,
];