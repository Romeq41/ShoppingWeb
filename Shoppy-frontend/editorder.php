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
        <div class="edit-order-form">
            <h2>Edit Order</h2>
            <form id="editOrder-form">
                <div class="form-group">
                    <label for="contact_first_name">Firstname:</label>
                    <input id="contact_first_name" name="contact_first_name" required type="text">
                </div>
                <div class="form-group">
                    <label for="contact_last_name">Lastname:</label>
                    <input id="contact_last_name" name="contact_last_name" required type="text">
                </div>
                <div class="form-group contact-phone">
                    <label for="contact_phone">Phone:</label>
                    <input id="contact_phone" name="contact_phone" required type="text">
                    <p id="phone-error-msg"></p>
                </div>
                <div class="form-group contact-email">
                    <label for="contact_email">Email:</label>
                    <input id="contact_email" name="contact_email" required type="email">
                    <p id="email-error-msg"></p>
                </div>
                <div class="form-group contact-userID">
                    <label for="userID">User ID:</label>
                    <input id="userID" name="userID" type="number">
                </div>
                <div class="form-group">
                    <label for="total">Total:</label>
                    <input id="total" name="total" required type="number" step="0.01" >
                </div>
                <div class="form-group">
                    <label for="isFullfilled">Is Fullfilled:</label>
                    <select id="isFullfilled" name="isFullfilled" required>
                        <option value="0">False</option>
                        <option value="1">True</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="paymentMethod">Payment Method:</label>
                    <select id="paymentMethod" name="paymentMethod" required type="text">
                        <option value="card">card</option>
                        <option value="cash">cash</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="deliveryMethod">Delivery Method:</label>
                    <select id="deliveryMethod" name="deliveryMethod" required type="text">
                        <option value="courier">courier</option>
                        <option value="pickup">pickup</option>
                    </select>
                </div>
                <div id="edit-order-address">
                    <h2>Address</h2>
                    <div class="form-group">
                        <label for="street">Street:</label>
                        <input type="text" id="street" name="street" placeholder="Al. Jerozolimskie 25a" required>
                    </div>
                    <div class="form-group">
                        <label for="city">City:</label>
                        <input type="text" id="city" name="city" placeholder="Warsaw" required>
                    </div>
                    <div class="form-group zipcode">
                        <label for="zipcode">Zip Code:</label>
                        <input type="text" id="zipcode" name="zipcode" placeholder="12-345" required>
                        <p id="zipcode-error-msg"></p>
                    </div>
                </div>


                <button type="submit">Save Changes</button>
            </form>
        </div>
    </main>
</div>
<!-- End Banner -->
<footer-component></footer-component>
<script src="./assets/Js/components/footer.js"></script>

<script src="./assets/Js/all.min.js"></script>
<script src="./assets/Js/editorder.js" type="module"></script>

<div class="overlay" id="loading-screen">
    <div class="spinner"></div>
</div>
</body>
</html>