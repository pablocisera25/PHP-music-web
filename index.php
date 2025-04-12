<?php
require __DIR__ . '/config/Database.php'; // Cargamos el Singleton

// 2. Verificación de sesión (PRIMERO, antes que todo)
require_once __DIR__.'/core/auth_checkout.php';
CheckSession::validate(); // Versión simplificada

// Verificar conexión y crear tabla si no existe
try {
    $connection = Database::getInstance(); // Obtenemos la conexión Singleton
    
    //echo "Conexión establecida correctamente con " . ($_ENV['APP_ENV'] === 'dev' ? 'SQLite' : 'PostgreSQL');
    
    // Función actualizada para usar PDO directamente
    function tableExists($pdo, $table) {
        try {
            // Consulta compatible con SQLite y PostgreSQL
            $result = $_ENV['APP_ENV'] === 'dev' 
                ? $pdo->query("SELECT 1 FROM $table LIMIT 1")
                : $pdo->query("SELECT EXISTS(SELECT 1 FROM $table)");
            return $result !== false;
        } catch (PDOException $e) {
            return false;
        }
    }
    
    if (!tableExists($connection, 'users')) {
        require __DIR__ . '/../migrations/0001_create_users_table.php';
    }

} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>

<!-- Resto de tu HTML permanece igual -->

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administracion musical</title>
    <link rel="stylesheet" href="public/css/global.css">
    <link rel="stylesheet" href="public/css/nav.css">
</head>

<body>
    <?php include './components/nav.php'; ?>
    <div class="main">

        <?php
        $page = $_GET['page'] ?? null;

        if ($page === null) {
            include "./views/home.php";
        } elseif ($page === 'login') {
            include "./views/login.php";
        } elseif ($page === 'register') {
            include "./views/register.php";
        } elseif ($page === 'recommends') {
            include "./views/recommends.php";
        } elseif($page==='configuration'){
            include "./views/configuration.php";
        } elseif($page === 'profile'){
            include "./views/profile.php";
        } elseif($page === 'search'){
            include "./views/search.php";
        } else {
            include "./views/error.php";
        }
        ?>

    </div> 
</body>

</html>