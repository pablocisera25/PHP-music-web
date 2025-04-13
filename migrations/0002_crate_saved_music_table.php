<?php

require_once __DIR__ . '/../config/database.php';

$connection = Database::getInstance();

$isSqlite = $connection->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite';

if ($isSqlite) {
    $sql = "
        CREATE TABLE IF NOT EXISTS saved_music (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INT NOT NULL,
            video_id VARCHAR(20) NOT NULL,
            title VARCHAR(255) NOT NULL,
            channel VARCHAR(255),
            thumbnail TEXT,
            url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ";
}

try {
    $connection -> exec($sql);
    echo "Table 'users' created successfully in " . $isSqlite;
} catch (PDOException $e) {
    die("Error creating table: " . $e->getMessage());
}