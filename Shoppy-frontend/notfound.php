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
    <meta content="IE=edge" http-equiv="X-UA-Compatible"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Shoppy - A place to find anything</title>
    <link href="./assets/images/shopping-bag-2-solid-svgrepo-com.svg" rel="icon" type="image/x-icon"/>
    <!-- Normalize File -->
    <link href="./assets/Css/normalize.css" rel="stylesheet"/>
    <!-- Css Files-->
    <link href="./assets/Css/main.css" rel="stylesheet"/>
    <link href="./assets/Css/products.css" rel="stylesheet">
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

<div class="landing">
    <div class="slides">
        <div class="slide not-found">
            <div class="container">
                <div class="content">
                    <span>Oh nooo</span>
                    <h3>Page Not Found!</h3>
                    <p style="color: var(--mainColor)">It seems page you are looking for does not exist</p>
                    <a href="./index.php">Go back to home</a>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- Start Banner -->
<div class="banner">
    <div class="container">
        <div class="row">
            <div class="box">
                <div class="content">
                    <span>crazy deals</span>
                    <h3>buy 1 get 1 free</h3>
                    <p>The best classic dress is on sale at cara</p>
                    <a href="">Learn More</a>
                </div>
            </div>

            <div class="box">
                <div class="content">
                    <span>crazy deals</span>
                    <h3>buy 1 get 1 free</h3>
                    <p>The best classic dress is on sale at cara</p>
                    <a href="">Learn More</a>
                </div>
            </div>
        </div>

        <div class="row-2">
            <div class="box">
                <h3>seasonal sale</h3>
                <p>winter collection -50% off</p>
            </div>

            <div class="box">
                <h3>new footwear collection</h3>
                <p>Spring / Summer 2022</p>
            </div>

            <div class="box">
                <h3>t-shirts</h3>
                <p>New Trendy Prints</p>
            </div>
        </div>
    </div>
</div>

<!-- End Banner -->
<footer-component></footer-component>
<script src="./assets/Js/components/footer.js"></script>

<div class="overlay" id="loading-screen">
    <div class="spinner"></div>
</div>
</body>
</html>


<pre>
    <?php
    print_r($_SESSION);
    ?>
</pre>