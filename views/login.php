<?php

require_once __DIR__.'/../controllers/UserController.php';

$userController = new UserController();
$error = '';

if($_SERVER['REQUEST_METHOD'] === 'POST')
{

    $remember = false;
    
    if(isset($_POST['remember']) && $_POST['remember'] === 'true') {
        $remember = true;
    }


    $result = $userController->login(
        $_POST['email'], 
        $_POST['password'],
        $remember
    );

    if($result['success'])
    {
        header('Location: ?page=recomendados');
        exit();
    } else {
        $error = $result['message'];
    }
}
?>

<link rel="stylesheet" href="/public/css/login.css">
<div class="login-container">
    <div class="card">
        <?php if(!empty($error)): ?>
                <div class="error-message"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <h3>Iniciar sesión</h3>

        <form method="post">
            <label for="email">Email</label>
            <input type="email" name="email" id="email" required value="<?php echo htmlspecialchars($_POST['email']); ?>">

            <label for="password">Constraseña</label>
            <input type="password" name="password" id="password" required>

            <div class="remember-forgot">
                <label for="checkbox">
                    <input type="checkbox" name="remember" id="remember" value="true"> Recordar sesión
                </label>
                <a href="forgot-password.php">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit">ingresar</button>
        </form>
    </div>
</div>