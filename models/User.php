<?php

require_once __DIR__.'/BaseModel.php';

class User extends BaseModel
{
    public function __construct()
    {
        parent::__construct('users');
    }

    public function getAll()
    {
        return $this->All();
    }

    public function register($name, $email, $password, $role = 'user')
    {
        if($this->exists('email', $email))
        {
            throw new Exception('El email ya esta registrado');
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $this->db->prepare(
            "INSERT INTO {$this->table}(name, email, password, role) VALUES (:name, :email, :password, :role)"
        );

        return $stmt->execute([
            'name'=>$name,
            'email'=>$email,
            'password'=>$hashedPassword,
            'role'=>$role
        ]);
    }

    public function autheticate($email, $password, $remember=false)
    {
        $user = $this->findByEmail($email);

        if($user && password_verify($password, $user['password']))
        {
            $this->saveTokenIntoSession($user, $remember);
            return $user;
        }

        return false;
    }

    public function destroyAuthSession()
    {
        return parent::destroyAuthSession();
    }
}