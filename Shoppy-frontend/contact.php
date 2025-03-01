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
    <link href="./assets/Css/contact.css" rel="stylesheet"/>
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


<!-- Start Contact Us Section -->
<div class="contact-us">
    <div class="container">
        <div class="content">
            <span>GET IN TOUCH</span>
            <h3>Visit one of our agency locations or contact us today</h3>
            <span>Head Office</span>

            <ul>
                <li>
                    <div class="icon"><i class="fa-solid fa-map-location"></i></div>
                    <p>123 Main Street, Warsaw, Poland</p>
                </li>
                <li>
                    <div class="icon"><i class="fa-solid fa-envelope"></i></div>
                    <p>support@shoppy.com</p>
                </li>
                <li>
                    <div class="icon"><i class="fa-solid fa-phone"></i></div>
                    <p>+48 22 123 4567</p>
                </li>
                <li>
                    <div class="icon"><i class="fa-regular fa-clock"></i></div>
                    <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
                </li>
            </ul>
        </div>

        <div class="location">
            <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2443.5027216046753!2d21.012228316060133!3d52.22967597975785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ecc669f211b27%3A0xa2e939ac8d3df9!2sWarsaw!5e0!3m2!1sen!2spl!4v1697039440014!5m2!1sen!2spl"
                    width="600"
                    height="450"
                    style="border:0;"
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade">
            </iframe>
        </div>
    </div>
</div>
<!-- End Contact Us Section -->

<!-- Start Message -->
<div class="message">
    <div class="container">
        <div class="text">
            <span>leave a message</span>
            <h3>We love to hear from you</h3>
        </div>

        <form action="">
            <input id="name" name="name" placeholder="Your Name" type="text"/>
            <input id="email" name="email" placeholder="E-Mail" type="text"/>
            <input
                    id="subject"
                    name="subject"
                    placeholder="Subject"
                    type="text"
            />
            <textarea
                    id="textarea"
                    name="textarea"
                    placeholder="Your Message"
            ></textarea>
            <input type="submit" value="submit"/>
        </form>
    </div>
</div>
<!-- End Message -->

<footer-component></footer-component>
<script src="./assets/Js/components/footer.js"></script>

<script src="./assets/Js/all.min.js"></script>
<script src="./assets/Js/auth.js" type="module"></script>
<script src="./assets/Js/userPage.js" type="module"></script>
<script src="./assets/Js/contact.js" type="module"></script>
<div class="overlay" id="loading-screen">
    <div class="spinner"></div>
</div>
</body>
</html>
