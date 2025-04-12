<?php
require_once __DIR__ . '/../models/User.php';

class UserController
{
    private $userModel;

    public function __construct()
    {
        // El modelo ahora obtiene su propia conexión
        $this->userModel = new User();
    }

    public function register($name, $email, $password, $role = 'user')
    {
        // Validación adicional
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [
                'success' => false,
                'message' => 'Email no válido'
            ];
        }

        if(empty($name) || empty($password))
        {
            return [
                "success"=> false,
                "message"=> 'All fiels are required'
            ];
        }

        try {
            $result = $this->userModel->register($name, $email, $password, $role);

            if($result)
            {
                return [
                    "success"=> true,
                    "message"=> 'User registried successfully',
                    "user"=> $this->userModel->findByEmail($email)
                ];
            }

            return[
                "success"=>false,
                "message"=> "Error al registrar el usuario"
            ];
        } catch (Exception $e) {
            return [
                "success"=> false,
                "message"=> $e->getMessage()
            ];
        }
    }

    public function login($email, $password, $remember = false)
    {
        $user = $this->userModel->autheticate($email, $password, $remember);

        return $user ? ['success' => true, 'user'=>$user] : ['success'=> false, 'message'=> 'Credenciales incorrectas'];
    }

    public function logout()
    {
        $result = $this->userModel->destroyAuthSession();
        
        // Verificación adicional para asegurar el logout
        $sessionActive = session_status() === PHP_SESSION_ACTIVE;
        
        return [
            "success" => $result && !$sessionActive,
            "status" => session_status()
        ];
    }
}