<?php
// config/database.php

require_once __DIR__ . '/Database.php'; // Incluimos la nueva clase Singleton

// Función legacy para compatibilidad (puedes eliminarla gradualmente)
/*function getConnection() {
    return Database::getInstance();
}*/

// Configuración antigua (para migración gradual)
$config = require __DIR__ . '/config.php';

return [
    'env' => $config['env'],
    'db_config' => $config['db_config']
];