<?php 

// nav.php - Modifica el inicio así:
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

require_once __DIR__.'/../controllers/UserController.php';

// Manejar el logout como primera operación
if(isset($_GET['action']) && $_GET['action'] === 'logout') {
    $user_controller = new UserController();
    $response = $user_controller->logout();
    
    // Redirigir inmediatamente después del logout
    if($response['success']) {
        header('Location: ?page=login');
        exit(); // Importante: terminar la ejecución aquí
    }
    // Opcional: manejar el caso de error
}
?>

<!-- Resto del código HTML -->

<div class="nav-container">
    <nav class="nav">
        <div class="section-left">
            <a href="?page=recommends">Recomendados</a>
            <a href="?page=search">Busqueda</a>
            <a href="?page=playlist">Playlist</a>
        </div>
        <div class="section-right">
            <?php if(isset($_SESSION['username'])): ?>
                <span class="username">Hola, <?= htmlspecialchars($_SESSION['username']) ?></span>
            <?php endif; ?>
            <?php if(isset($_SESSION['auth_token']) && !empty($_SESSION['auth_token'])): ?>
                <div class="dropdown">
                    <button class="dropbtn">Menú</button>
                    <div class="dropdown-content">
                        <a href="?page=profile">Perfil</a>
                        <a href="?page=configuration">Configuración</a>
                        <a href="?action=logout">Salir</a>
                    </div>
                </div>
            <?php else: ?>
                <a href="?page=login">Login</a>
                <a href="?page=register">Register</a>
            <?php endif ?>
        </div>
    </nav>
</div>