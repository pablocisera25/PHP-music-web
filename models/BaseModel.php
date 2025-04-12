<?php

require_once __DIR__.'/../config/Database.php';

abstract class BaseModel{
    protected $db;
    protected $table;

    public function __construct($table)
    {
        $this->db = Database::getInstance();
        $this->table = $table;
    }

    public function findByEmail($email)
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM {$this->table} WHERE email = :email LIMIT 1"
        );

        $stmt->execute(['email'=>$email]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function exists($field, $value)
    {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM {$this->table} WHERE {$field} = :value"
        );

        $stmt->execute(['value'=>$value]);

        return $stmt->fetchColumn() > 0;
    }

    public function find($id)
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1"
        );

        $stmt->execute(['id'=> $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function All($columns=['*'])
    {
        $columns = implode(', ', $columns);

        $stmt = $this->db->query(
            "SELECT {$columns} FROM {$this->table}"
        );

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function generateToken()
    {
        return bin2hex(random_bytes(32));
    }

    public function saveTokenIntoSession($userData, $remember=false)
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start(); // Inicia sesión si no está activa
        }

        $_SESSION['auth_token'] = $this->generateToken();
        $_SESSION['user_data'] = $userData;
        $_SESSION['expires_at'] = $remember ? time() + (86400 * 30) : time() + (86400 * 1);

        session_write_close();
    }

    public function validateSessionToken()
    {
        session_start();
        return !empty($_SESSION['auth_token']) && $_SESSION['expires_at'] > time();
    }

    public function destroyAuthSession()
    {
        // Solo iniciar sesión si no está activa
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Limpiar todas las variables de sesión
        $_SESSION = [];
        
        // Destruir la sesión completamente
        if (session_destroy()) {
            // Limpiar la cookie de sesión
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(
                    session_name(), 
                    '', 
                    time() - 42000,
                    $params["path"],
                    $params["domain"],
                    $params["secure"],
                    $params["httponly"]
                );
            }
            return true;
        }
        
        return false;
    }
}