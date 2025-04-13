<?php
// config/Database.php

class Database
{
    private static $instance = null;
    private $connection;

    private function __construct()
    {
        $config = require_once __DIR__ . '/config.php';
        
        try {
            if ($config['env'] === 'dev') {
                $this->connection = new PDO('sqlite:' . $config['db_config']['database']);
            } else {
                $dsn = "{$config['db_config']['driver']}:host={$config['db_config']['host']};" .
                       "port={$config['db_config']['port']};dbname={$config['db_config']['database']}";
                $this->connection = new PDO($dsn, $config['db_config']['username'], $config['db_config']['password']);
            }
            
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
        } catch (PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }

    public static function getInstance()
    {
        if (!self::$instance) {
            self::$instance = new Database();
        }
        return self::$instance->connection;
    }

    // Función legacy para compatibilidad
    public static function getConnection()
    {
        return self::getInstance();
    }
}

