-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 06, 2025 at 12:51 PM
-- Wersja serwera: 10.4.32-MariaDB
-- Wersja PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shoppy`
--
CREATE DATABASE IF NOT EXISTS `shoppy` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `shoppy`;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `address`
--

CREATE TABLE `address` (
  `addressID` int(11) NOT NULL,
  `userID` int(11) DEFAULT NULL,
  `street` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `zipcode` varchar(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `address`
--

INSERT INTO `address` (`addressID`, `userID`, `street`, `city`, `zipcode`) VALUES
(74, 15, 'groove', 'lodz', '90-633'),
(78, 21, 'Fajna', 'Lodz', '10-100'),
(79, NULL, 'costam', 'costam', '12-123'),
(80, 19, 'costam', 'costam', '12-123');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `cart`
--

CREATE TABLE `cart` (
  `cartID` int(11) NOT NULL,
  `userID` int(11) DEFAULT NULL,
  `total` double DEFAULT 0,
  `isGuest` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`cartID`, `userID`, `total`, `isGuest`) VALUES
(1, 15, 123.12, 0),
(5, 19, 0, 0),
(6, 20, 0, 0),
(7, 21, 0, 0),
(12, 26, 0, 0);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `cartitem`
--

CREATE TABLE `cartitem` (
  `cartItemID` int(11) NOT NULL,
  `cartID` int(11) NOT NULL,
  `productID` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cartitem`
--

INSERT INTO `cartitem` (`cartItemID`, `cartID`, `productID`, `quantity`) VALUES
(295, 1, 20, 1);

--
-- Wyzwalacze `cartitem`
--
DELIMITER $$
CREATE TRIGGER `calculate_cart_total` AFTER INSERT ON `cartitem` FOR EACH ROW BEGIN
    DECLARE cart_total DECIMAL(10, 2);
    
    -- Calculate the total for the cart associated with the new item
    SELECT SUM(p.price * ci.quantity) INTO cart_total
    FROM cartitem ci
    JOIN products p ON ci.productID = p.productID
    WHERE ci.cartID = NEW.cartID;
    
    -- Update the total in the cart table
    UPDATE cart
    SET total = cart_total
    WHERE cartID = NEW.cartID;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `delete_cart_total` AFTER DELETE ON `cartitem` FOR EACH ROW BEGIN
    DECLARE cart_total DECIMAL(10, 2);

    -- Recalculate the total for the affected cart
    SELECT SUM(p.price * ci.quantity) INTO cart_total
    FROM cartitem ci
    JOIN products p ON ci.productID = p.productID
    WHERE ci.cartID = OLD.cartID;

    -- Update the cart's total
    UPDATE cart
    SET total = IFNULL(cart_total, 0) -- Set to 0 if there are no items left in the cart
    WHERE cartID = OLD.cartID;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_cart_total2` AFTER UPDATE ON `cartitem` FOR EACH ROW BEGIN
    DECLARE cart_total DECIMAL(10, 2);

    -- Recalculate the total for the affected cart
    SELECT SUM(p.price * ci.quantity) INTO cart_total
    FROM cartitem ci
    JOIN products p ON ci.productID = p.productID
    WHERE ci.cartID = NEW.cartID;

    -- Update the cart's total
    UPDATE cart
    SET total = cart_total
    WHERE cartID = NEW.cartID;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `favoriteproducts`
--

CREATE TABLE `favoriteproducts` (
  `favoriteProductID` int(11) NOT NULL,
  `userID` int(11) DEFAULT NULL,
  `productID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `orderitem`
--

CREATE TABLE `orderitem` (
  `orderItemID` int(11) NOT NULL,
  `orderID` int(11) NOT NULL,
  `productID` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `orders`
--

CREATE TABLE `orders` (
  `orderID` int(11) NOT NULL,
  `orderDate` datetime NOT NULL DEFAULT current_timestamp(),
  `userID` int(11) DEFAULT NULL,
  `isPaid` tinyint(1) NOT NULL DEFAULT 0,
  `paymentMethod` enum('card','cash') NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `deliveryMethod` enum('courier','pickup') NOT NULL,
  `orderAddressID` int(11) DEFAULT NULL,
  `isFullfilled` tinyint(1) NOT NULL DEFAULT 0,
  `order_contact_info_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `order_addresses`
--

CREATE TABLE `order_addresses` (
  `orderAddressID` int(11) NOT NULL,
  `street` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `zipcode` varchar(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_addresses`
--

INSERT INTO `order_addresses` (`orderAddressID`, `street`, `city`, `zipcode`) VALUES
(51, 'groove', 'lodz', '90-633'),
(54, 'groove', 'lodz', '90-633'),
(55, '1600 Fake Street', 'Mountain View', '94043');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `order_contact_info`
--

CREATE TABLE `order_contact_info` (
  `order_contact_info_id` int(11) NOT NULL,
  `contact_first_name` varchar(100) DEFAULT NULL,
  `contact_last_name` varchar(100) DEFAULT NULL,
  `contact_phone` varchar(15) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `products`
--

CREATE TABLE `products` (
  `productID` int(11) NOT NULL,
  `category` varchar(100) NOT NULL DEFAULT 'inne',
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` double NOT NULL,
  `imageURL` varchar(255) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `rating` double DEFAULT 0,
  `rating_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`productID`, `category`, `name`, `description`, `price`, `imageURL`, `stock`, `rating`, `rating_count`, `created_at`) VALUES
(4, '[value-2]', 'Super comfortable red hoodie', 'Nice, elegant, made with top-quality materials', 125, 'https://i.imgur.com/1twoaDy.jpeg', 23, 4.5, 2, '2024-10-23 07:43:08'),
(6, '[value-2]', 'Nice blue cap', 'cool cap', 35, 'https://i.imgur.com/R3iobJA.jpeg', 12, 3.4, 12, '0000-00-00 00:00:00'),
(8, '[value-2]', '[value-3]', '[value-4]', 13, 'https://i.imgur.com/Qphac99.jpeg', 22, 2.2, 33, '0000-00-00 00:00:00'),
(10, 'clothes', 'Loose flannel shirt', 'nice and soft', 123, 'assets/images/products/f2.jpg', 223, 2.5, 123, '0000-00-00 00:00:00'),
(12, 'akcesoria', 'Nice Cap Size L/M/S', '[value-4]', 0, 'https://i.imgur.com/cBuLvBi.jpeg', 1, 2.1, 12, '0000-00-00 00:00:00'),
(16, 'inne', 'suszarka', 'super hiper fajna', 22.9, 'https://i.imgur.com/ZANVnHE.jpeg', 20, 0, 0, '2024-11-17 22:35:57'),
(17, 'inne', 'Shirt', 'nice and super cheap', 10, 'assets/images/products/f3.jpg', 2331, 0, 0, '2024-11-17 22:37:40'),
(18, 'inne', 'Knee trousers', 'super comfortable material', 122, 'assets/images/products/f7.jpg', 3331, 0, 0, '2024-11-28 22:22:34'),
(19, 'inne', 'Loose material shirt', 'nice soft fabric', 825, 'assets/images/products/f8.jpg', 222, 0, 0, '2024-11-28 22:23:38'),
(20, 'inne', 'asdasd', 'asdasd', 123.12, 'assets/images/products/n6.jpg', 123, 0, 0, '2024-12-13 10:18:35'),
(21, 'inne', 'Grey Shorts', 'Very finely made grey shorts', 123.12, 'assets/images/products/f2.jpg', 123, 0, 0, '2024-12-13 10:30:42');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `reports`
--

CREATE TABLE `reports` (
  `reportID` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `report_data` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`reportID`, `name`, `email`, `subject`, `report_data`, `created_at`) VALUES
(11, '123', 'temp@temp.temp', 'adsdas', '3212231', '2024-11-15 12:44:25'),
(12, 'ads', 'temp@temp.temp', '123123', 'adsasddasads', '2024-11-15 12:45:58');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `userID` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `role` int(1) NOT NULL DEFAULT 0,
  `firstname` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `email`, `password`, `remember_token`, `created_at`, `updated_at`, `username`, `role`, `firstname`, `lastname`, `phone`) VALUES
(15, 'admin@admin.com', '$2y$10$wPs31vXnt7.VsIwsb377Nep6cZdP67rRF1W6VaBJgJEqJDD4mygCS', NULL, '2024-10-28 17:31:18', '2024-10-28 17:31:18', 'admin2', 1, 'januszex2aksjdhkjasd', 'janusz21', '000000000'),
(19, 'romek@gmail.com', '$2y$10$D3TD.fiAq5cp9UHh2q8IBex6F6Gq7TIeZUhjdTbj/bq9sHDBC5pmO', NULL, '2024-11-17 21:06:46', '2024-11-17 21:06:46', 'romek', 0, NULL, NULL, NULL),
(20, 'temp@temp.com', '$2y$10$dCbrvtevfYElaCnsFASr7OX3spS7vyinihDjeAR5z7XDu/bLGnSQ2', NULL, '2024-11-18 18:40:12', '2024-11-18 18:40:12', 'temp', 0, NULL, NULL, NULL),
(21, 'temp2@gmail.com', '$2y$10$mvDFfc7O3AWAzjo0.55UKO84g036HsKgeHgKQLIY8oU3KFLxdn8Ie', NULL, '2024-11-18 18:40:23', '2024-11-18 18:40:23', 'temp2', 0, 'temp2', 'temp2', '123123123'),
(26, 'pol@wp.pl', '$2y$10$t9V9hAQiHaETyQTcboZdguXdJi/x3gTqTtRs1xu8CHJO9/wKDeTT2', NULL, '2024-12-13 10:23:45', '2024-12-13 10:23:45', 'lol', 0, 'pawel', 'pawel', '123123123');

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `address`
--
ALTER TABLE `address`
  ADD PRIMARY KEY (`addressID`),
  ADD KEY `userID` (`userID`) USING BTREE;

--
-- Indeksy dla tabeli `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`cartID`),
  ADD KEY `userID` (`userID`);

--
-- Indeksy dla tabeli `cartitem`
--
ALTER TABLE `cartitem`
  ADD PRIMARY KEY (`cartItemID`),
  ADD KEY `cartID` (`cartID`),
  ADD KEY `productID` (`productID`);

--
-- Indeksy dla tabeli `favoriteproducts`
--
ALTER TABLE `favoriteproducts`
  ADD PRIMARY KEY (`favoriteProductID`),
  ADD KEY `userID` (`userID`),
  ADD KEY `productID` (`productID`);

--
-- Indeksy dla tabeli `orderitem`
--
ALTER TABLE `orderitem`
  ADD PRIMARY KEY (`orderItemID`),
  ADD KEY `productID` (`productID`),
  ADD KEY `orderitem_ibfk_1` (`orderID`);

--
-- Indeksy dla tabeli `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`orderID`),
  ADD KEY `fk_user` (`userID`),
  ADD KEY `fk_order_address` (`orderAddressID`),
  ADD KEY `fk_order_contact_info` (`order_contact_info_id`);

--
-- Indeksy dla tabeli `order_addresses`
--
ALTER TABLE `order_addresses`
  ADD PRIMARY KEY (`orderAddressID`);

--
-- Indeksy dla tabeli `order_contact_info`
--
ALTER TABLE `order_contact_info`
  ADD PRIMARY KEY (`order_contact_info_id`);

--
-- Indeksy dla tabeli `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`productID`);

--
-- Indeksy dla tabeli `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`reportID`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `address`
--
ALTER TABLE `address`
  MODIFY `addressID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `cartID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `cartitem`
--
ALTER TABLE `cartitem`
  MODIFY `cartItemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=296;

--
-- AUTO_INCREMENT for table `favoriteproducts`
--
ALTER TABLE `favoriteproducts`
  MODIFY `favoriteProductID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orderitem`
--
ALTER TABLE `orderitem`
  MODIFY `orderItemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `orderID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

--
-- AUTO_INCREMENT for table `order_addresses`
--
ALTER TABLE `order_addresses`
  MODIFY `orderAddressID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `order_contact_info`
--
ALTER TABLE `order_contact_info`
  MODIFY `order_contact_info_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `productID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `reportID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `address`
--
ALTER TABLE `address`
  ADD CONSTRAINT `address_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cartitem`
--
ALTER TABLE `cartitem`
  ADD CONSTRAINT `cartitem_ibfk_1` FOREIGN KEY (`cartID`) REFERENCES `cart` (`cartID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cartitem_ibfk_2` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`);

--
-- Constraints for table `favoriteproducts`
--
ALTER TABLE `favoriteproducts`
  ADD CONSTRAINT `favoriteproducts_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE,
  ADD CONSTRAINT `favoriteproducts_ibfk_2` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`) ON DELETE CASCADE;

--
-- Constraints for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD CONSTRAINT `orderitem_ibfk_1` FOREIGN KEY (`orderID`) REFERENCES `orders` (`orderID`) ON DELETE CASCADE,
  ADD CONSTRAINT `orderitem_ibfk_2` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_address` FOREIGN KEY (`orderAddressID`) REFERENCES `order_addresses` (`orderAddressID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_contact_info` FOREIGN KEY (`order_contact_info_id`) REFERENCES `order_contact_info` (`order_contact_info_id`),
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
