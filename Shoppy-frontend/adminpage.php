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

if(!isset($_SESSION['admin']) || $_SESSION['admin'] != 1) {
    header('Location: notfound.php');
    exit();
}

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
    <link href="./assets/Css/adminpage.css" rel="stylesheet"/>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com" rel="preconnect"/>
    <link crossorigin href="https://fonts.gstatic.com" rel="preconnect"/>
    <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap"
            rel="stylesheet"
    />
    <meta name="csrf-token" content="<?php echo $csrfToken; ?>">
</head>
<body>
<!-- Start Banner -->

<div class="admin-container">
    <aside class="sidebar">
        <ul>
            <li>
                <button id="users-button">Users</button>
            </li>
            <li>
                <button id="products-button">Products</button>
            </li>
            <li>
                <button id="orders-button">Orders</button>
            </li>
            <li>
                <button id="reports-button">Reports</button>
            </li>
        </ul>
    </aside>
    <main id="admin-content">
        <!-- Admin content will be dynamically inserted here -->
    </main>
</div>
<!-- End Banner -->
<footer-component></footer-component>
<script src="./assets/Js/components/footer.js"></script>

<script src="./assets/Js/all.min.js"></script>
<script src="./assets/Js/adminpage.js" type="module"></script>

<div class="overlay" id="loading-screen">
    <div class="spinner"></div>
</div>
</body>
</html>
