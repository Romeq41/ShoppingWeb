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
    <link href="./assets/images/shopping-bag-2-solid-svgrepo-com.svg" rel="icon" type="image/x-icon"/>
    <title>Shoppy - A place to find anything</title>
    <!-- Normalize File -->
    <link href="./assets/Css/normalize.css" rel="stylesheet"/>
    <!-- Css File-->
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

<!-- Start shop-header -->
<div class="shop-header">
    <div class="content">
        <h1>#Stayhome</h1>
        <h3>Up to <span>70% Off</span>-All T-Shirts & Accessories</h3>
    </div>
</div>
<!-- Start features-products -->
<div class="products-view" id="shopView">
    <div class="searchResultSection">
        <h2 class="main-header" id="searchResultSectionTag"></h2>
        <p id="search-result-message"></p>
        <div class="container" id="searchResults">
        </div>
    </div>

    <div class="offer searchOffer" id="offer" style="display: none">
        <div class="content">
            <p>Rapair Services</p>
            <h3>Up to <span>70% Off</span>-All T-Shirts & Accessories</h3>
            <a href="shop.php">Explore More</a>
        </div>
    </div>
    <h2 class="main-header">Our most popular products</h2>
    <p>See what our clientele likes the most!</p>
    <div class="container" id="most-popular-products-container">
    </div>
</div>
<!-- End features-products -->

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

<footer-component></footer-component>
<script src="./assets/Js/components/footer.js"></script>

<script src="./assets/Js/all.min.js"></script>
<script src="./assets/Js/product.js" type="module"></script>
<script src="assets/Js/shop.js" type="module"></script>

<div class="overlay" id="loading-screen">
    <div class="spinner"></div>
</div>
</body>
</html>
