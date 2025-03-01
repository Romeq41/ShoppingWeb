<?php
session_start();

function generateCsrfToken()
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

$csrfToken = generateCsrfToken();
include('./assets/Js/components/header.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta content="IE=edge" http-equiv="X-UA-Compatible"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Shoppy - A place to find anything</title>
    <link href="./assets/images/shopping-bag-2-solid-svgrepo-com.svg" rel="icon" type="image/x-icon"/>
    <!-- Normalize File -->
    <link href="./assets/Css/normalize.css" rel="stylesheet"/>
    <!-- Css File-->
    <link href="./assets/Css/main.css" rel="stylesheet"/>
    <!-- Font Awesome -->
    <link href="./assets/Css/all.min.css" rel="stylesheet"/>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com" rel="preconnect"/>
    <link crossorigin href="https://fonts.gstatic.com" rel="preconnect"/>
    <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap"
            rel="stylesheet"
    />
    <meta name="csrf-token" content="<?php echo htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>">
</head>
<body>
<!-- Start Banner -->
<div class="userView" id="userView">
    <div class="register-form">
        <h2>Register</h2>
        <form id="registerForm">
            <label for="username1"></label><input type="text" id="username1" placeholder="Username" required/>
            <label for="email"></label><input type="email" id="email" placeholder="Email" required/>
            <label for="password"></label><input type="password" id="password" placeholder="Password" required/>
            <label for="confirmPassword"></label><input type="password" id="confirmPassword" placeholder="Confirm Password" required/>
            <button type="submit">Register</button>
        </form>
        <div id="registerError" style="color:red;"></div>
        <p>Already have an account? <a href="userpage.php">Login</a></p>
    </div>
</div>
<!-- End Banner -->
<footer-component></footer-component>
<script src="./assets/Js/components/footer.js"></script>

<script src="./assets/Js/all.min.js"></script>
<script src="./assets/Js/register.js"></script>

<div class="overlay" id="loading-screen">
    <div class="spinner"></div>
</div>
</body>
</html>