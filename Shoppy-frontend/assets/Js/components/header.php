
<!-- Start Header -->
<div class="header">
        <a href="./index.php" class="logo">ShoppingWeb</a>
        <div class="searchbar">
            <input type="text" placeholder="Search..." />
            <button><i class="fa-solid fa-search"></i></button>
        </div>
        <div class="nav" id="nav">
            <ul class="nav-links" id="nav-links">
                <li><a href="./shop.php">Shop</a></li>
                <li><a href="./about.php">About</a></li>
                <li><a href="./contact.php">Contact</a></li>
            </ul>
            <div class="icon" id="toggle">
                <i class="fa-solid fa-bars"></i>
            </div>
            <div class="icon" id="heart">
                <a href="./favorites.php">
                    <i class="fa-solid fa-heart"></i>
                    <span id="favorite-count"></span>
                </a>
            </div>
            <div class="icon" id="cart">
                <a href="./cart.php">
                    <i class="fa-solid fa-bag-shopping"></i>
                    <span id="cartItem-count"></span>
                </a>
            </div>
            <div class="icon" id="user">
                <i class="fa-solid fa-user" id="userIcon"></i>
                <p id="username"></p>
            </div>
            <ul id="user-menu">
                <li id="admin-page-button"><a href="./adminpage.php">Admin page</a></li>
                <li id="user-page-button"><a href="./userpage.php">User page</a></li>
                <li id="my-orders-button"><a href="./orders.php">My Orders</a></li>
                <li id="logout-button">Logout</li>
                <li id="login-button"><a href="./userpage.php">Login</a></li>
            </ul>
        </div>
</div>

<link href="./assets/Js/components/header.css" rel="stylesheet"/>
<script src="./assets/Js/components/header.js" type="module"></script>
<!-- End Header -->
