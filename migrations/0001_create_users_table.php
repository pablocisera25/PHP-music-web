<?php

require_once __DIR__ . '/../config/Database.php';
$connection = Database::getInstance(); // ✅ Usa Singleton directo


$isSqlite = $connection->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite';

if ($isSqlite) {
    $sql = "
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'admin', 'guest')) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
} else {
    $sql = "
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK(role IN ('user', 'admin', 'guest')) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
}

try {
    $connection->exec($sql);
    echo "Table 'users' created successfully in " . ($isSqlite ? 'SQLite' : 'PostgreSQL') . " database.\n";
    
    // Add trigger for PostgreSQL
    if (!$isSqlite) {
        $triggerSql = "
        CREATE OR REPLACE FUNCTION update_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS update_users_timestamp ON users;
        CREATE TRIGGER update_users_timestamp
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
        ";
        $connection->exec($triggerSql);
        echo "Auto-update trigger created for 'updated_at' column.\n";
    }
} catch (PDOException $e) {
    die("Error creating table: " . $e->getMessage());
}