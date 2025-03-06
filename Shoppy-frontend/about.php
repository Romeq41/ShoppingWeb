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
    <link href="./assets/Css/about.css" rel="stylesheet"/>
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
    <meta name="csrf-token" content="<?php echo $csrfToken; ?>">
</head>
<body>

<!-- Start about-header -->
<div class="about-header">
    <div class="content">
        <h1>#Stayhome</h1>
        <h3>Up to <span>70% Off</span>-All T-Shirts & Accessories</h3>
    </div>
</div>
<!-- End about-header -->

<!-- Start About -->
<div class="about">
    <div class="container">
        <div class="img-container">
            <img alt="" src="./assets/images/about/a6.jpg"/>
        </div>
        <div class="content">
            <h3>Who We Are?</h3>
            <p>
                ShoppingWeb is a leading online shopping portal specializing in
                electronics and contemporary fashion. With more than 20 million
                products listed on the site, it has become the go-to site for many
                shoppers across the world. ShoppingWeb is known for its wide range of
                products, user-friendly interface, and excellent customer service.
            </p>
        </div>
    </div>
</div>
<!-- End About -->
<footer-component></footer-component>
<script src="./assets/Js/components/footer.js"></script>

<script src="./assets/Js/all.min.js"></script>

<div class="overlay" id="loading-screen">
    <div class="spinner"></div>
</div>
</body>
</html>
