<?php

    require_once __DIR__ . '/../models/User.php';
    require_once __DIR__ . '/../controllers/UserController.php';
    require_once __DIR__ . '/../config/Database.php';
    
    $error = '';

    if($_SERVER['REQUEST_METHOD']=== 'POST')
    {
        $name = trim($_POST['name']);
        $email = trim($_POST['email']);
        $password = trim($_POST['password']);
        $role=trim($_POST['role']);

        if(empty($name) || empty($email) || empty($password) || empty($role)) {
            $error = 'Existen campos vacios. Vuelva a intentarlo';
        } else {
            try {

                $user_controller = new UserController();

                $result = $user_controller->register($name, $email, $password, $role);

                if($result['success'])
                {
                    error_log("Redirigiendo a login...");
                    header('Location: ?page=login');
                    exit();
                } else {
                    $error = $result['message'];
                }
            } catch (Exception $e) {
                $error = $e->getMessage();
            }
        }
    }
?>

<link rel="stylesheet" href="public/css/register.css">
<div class="register-container">
    <div class="card">

        <?php if(!empty($error)): ?>
            <div style="color:red"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <h3>Registro</h3>
        <form method="POST">
            <label for="name">nombre</label>
            <input type="text" name="name">

            <label for="email">email</label>
            <input type="email" name="email" id="email">

            <label for="password">contraseña</label>
            <input type="password" name="password" id="password">

            <label for="role">rol</label>
            <select name="role" id="role">
                <option value=""></option>
                <option value="admin">admin</option>
                <option value="user">user</option>
                <option value="guest">guest</option>
            </select>
            <button type="submit">enviar</button>
        </form>
    </div>
</div>