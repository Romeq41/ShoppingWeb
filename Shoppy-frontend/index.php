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

<!-- Start Landing -->
<div class="landing">
    <div class="slides">
        <div class="slide slide-1">
            <div class="container">
                <div class="content">
                    <span>Trade-in-offer</span>
                    <h3>Super Value deals</h3>
                    <h2>On all products</h2>
                    <p>Save more with coupons & up to 70% off!</p>
                    <a href="#productsView">Shop now</a>
                </div>
            </div>
        </div>
        <div class="slide slide-2">
            <div class="container left">
                <div class="content left">
                    <span>Trade-in-offer</span>
                    <h3>Super Value deals</h3>
                    <h2>On all products</h2>
                    <p>Save more with coupons & up to 70% off!</p>
                    <a href="">Shop now</a>
                </div>
            </div>
        </div>
        <div class="slide slide-3">
            <div class="container left">
                <div class="content left">
                    <span>Trade-in-offer</span>
                    <h3>Super Value deals</h3>
                    <h2>On all products</h2>
                    <p>Save more with coupons & up to 70% off!</p>
                    <a href="">Shop now</a>
                </div>
            </div>
        </div>

        <div class="slide slide-5">
            <div class="container ">
                <div class="content ">
                    <span>Trade-in-offer</span>
                    <h3>Super Value deals</h3>
                    <h2>On all products</h2>
                    <p>Save more with coupons & up to 70% off!</p>
                    <a href="">Shop now</a>
                </div>
            </div>
        </div>
    </div>
    <button class="arrow" id="prev">❮</button>
    <button class="arrow" id="next">❯</button>
    <a href="#productsView" class="see-more">
        <button id="see-more-button">
            See more
            <p>↓</p>
        </button>
    </a>
</div>
<!-- End Landing -->

<!-- Start features-products -->
<div class="products-view" id="productsView">
    <h2 class="main-header">Our most popular products</h2>
    <p>See what our clientele likes the most!</p>
    <div class="container" id="most-popular-products-container">
    </div>
</div>
<!-- End features-products -->
<!-- Start Offer -->
<div class="offer">
    <div class="content">
        <p>Rapair Services</p>
        <h3>Up to <span>70% Off</span>-All T-Shirts & Accessories</h3>
        <a href="shop.php">Explore More</a>
    </div>
</div>
<!-- End Offer -->
<!-- Start New Arrivals -->
<div class="products-view">
    <h2 class="main-header">New Arrivals</h2>
    <p>Summer Collection New Morden Design</p>
    <div class="container" id="newest-products-container">
    </div>
</div>
<!-- End New Arrivals -->
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

<script src="./assets/Js/all.min.js"></script>
<script src="./assets/Js/components/slider-carousel.js" type="module"></script>

<script src="./assets/Js/auth.js" type="module"></script>
<script src="./assets/Js/product.js" type="module"></script>
<script src="./assets/Js/cart.js" type="module"></script>
<script src="./assets/Js/NewestProducts.js" type="module"></script>
<script src="./assets/Js/MostPopularProducts.js" type="module"></script>


<div class="overlay" id="loading-screen">
    <div class="spinner"></div>
</div>
</body>
</html>