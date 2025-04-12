<?php
class CheckSession {
    public static function validate() {
        // No verificar en páginas públicas
        $current_page = $_GET['page'] ?? 'home';
        if ($current_page === 'login' || $current_page === 'register') {
            return;
        }

        // Iniciar sesión si no está activa
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }

        // Verificar solo el token
        if (empty($_SESSION['auth_token'])) {
            header('Location: /?page=login');
            exit();
        }
    }
}