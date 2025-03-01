<?php

class Order
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getOrders(): void
    {
        $stmt = $this->pdo->query("SELECT * FROM orders");
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($orders) {
            foreach ($orders as $key => $order) {
                $stmt = $this->pdo->prepare("SELECT * FROM order_addresses WHERE orderAddressID = ?");
                $stmt->execute([$order['orderAddressID']]);
                $orderAddress = $stmt->fetch(PDO::FETCH_ASSOC);

                $orders[$key]['orderAddress'] = $orderAddress;

                $stmt = $this->pdo->prepare("SELECT * FROM order_contact_info WHERE order_contact_info_id = ?");
                $stmt->execute([$order['order_contact_info_id']]);
                $orderContactInfo = $stmt->fetch(PDO::FETCH_ASSOC);

                $orders[$key]['orderContactInfo'] = $orderContactInfo;
            }
            http_response_code(200);
            echo json_encode($orders);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'No orders found']);
        }

    }

    public function getOrder($id,$userVerificationRes): void
    {
        $stmt = $this->pdo->prepare("SELECT * FROM orders WHERE orderID = ?");
        $stmt->execute([$id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($order) {
            if($order['userID'] != $userVerificationRes->userID && $userVerificationRes->role != '1'){
                http_response_code(401);
                echo json_encode(['ok' => false, 'message' => 'Unauthorized']);
                return;
            }

            $stmt = $this->pdo->prepare("SELECT * FROM order_addresses WHERE orderAddressID = ?");
            $stmt->execute([$order['orderAddressID']]);
            $orderAddress = $stmt->fetch(PDO::FETCH_ASSOC);

            $order['orderAddress'] = $orderAddress;

            $stmt = $this->pdo->prepare("SELECT * FROM order_contact_info WHERE order_contact_info_id = ?");
            $stmt->execute([$order['order_contact_info_id']]);
            $orderContactInfo = $stmt->fetch(PDO::FETCH_ASSOC);

            $order['orderContactInfo'] = $orderContactInfo;

            http_response_code(200);
            echo json_encode($order);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Order not found']);
        }
    }

    public function getOrderWithItems($orderID,$userVerificationID): void
    {
        $stmt = $this->pdo->prepare("SELECT * FROM orders WHERE orderID = ?");
        $stmt->execute([$orderID]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($order) {
            if($order['userID'] != $userVerificationID){
                http_response_code(401);
                echo json_encode(['ok' => false, 'message' => 'Unauthorized']);
                return;
            }
            $stmt = $this->pdo->prepare("SELECT * FROM orderitem WHERE orderID = ?");
            $stmt->execute([$orderID]);
            $orderItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $order['orderItems'] = $orderItems;

            $stmt = $this->pdo->prepare("SELECT * FROM order_addresses WHERE orderAddressID = ?");
            $stmt->execute([$order['orderAddressID']]);
            $orderAddress = $stmt->fetch(PDO::FETCH_ASSOC);

            $order['orderAddress'] = $orderAddress;

            $stmt = $this->pdo->prepare("SELECT * FROM order_contact_info WHERE order_contact_info_id = ?");
            $stmt->execute([$order['order_contact_info_id']]);
            $orderContactInfo = $stmt->fetch(PDO::FETCH_ASSOC);

            $order['orderContactInfo'] = $orderContactInfo;
            http_response_code(200);
            echo json_encode(['ok' => true, 'order' => $order]);
        } else {
            http_response_code(404);
            echo json_encode(['ok' => false, 'message' => 'Order not found']);
        }
    }

    public function getOrdersByUserID($userID): void
    {
        $stmt = $this->pdo->prepare("SELECT * FROM orders WHERE userID = ?");
        $stmt->execute([$userID]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($orders) {
            foreach ($orders as $key => $order) {
                $stmt = $this->pdo->prepare("SELECT * FROM order_addresses WHERE orderAddressID = ?");
                $stmt->execute([$order['orderAddressID']]);
                $orderAddress = $stmt->fetch(PDO::FETCH_ASSOC);

                $orders[$key]['orderAddress'] = $orderAddress;

                $stmt = $this->pdo->prepare("SELECT * FROM order_contact_info WHERE order_contact_info_id = ?");
                $stmt->execute([$order['order_contact_info_id']]);
                $orderContactInfo = $stmt->fetch(PDO::FETCH_ASSOC);

                $orders[$key]['orderContactInfo'] = $orderContactInfo;
            }
            http_response_code(200);
            echo json_encode(['ok' => true, 'orders' => $orders]);
        } else {
            http_response_code(404);
            echo json_encode(['ok' => false, 'message' => 'No orders found']);
        }
    }

    public function getOrderItems($orderID): void
    {
        $stmt = $this->pdo->prepare("SELECT * FROM orderitem WHERE orderID = ?");
        $stmt->execute([$orderID]);
        $orderItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($orderItems) {
            http_response_code(200);
            echo json_encode(['ok' => true, 'orderItems' => $orderItems]);
        } else {
            http_response_code(404);
            echo json_encode(['ok' => false, 'message' => 'No order items found']);
        }
    }

    public function createOrder(): void
{
    $data = json_decode(file_get_contents('php://input'), true);
    $this->pdo->beginTransaction();

    try {
        $addressID = null;
        if ($data['deliveryMethod'] === 'courier') {
            $city = $data['city'];
            $street = $data['street'];
            $zipcode = $data['zipcode'];

            $addressStmt = $this->pdo->prepare("INSERT INTO order_addresses (street, city, zipcode) VALUES (?,?,?)");
            if ($addressStmt->execute([$street, $city, $zipcode])) {
                $addressID = $this->pdo->lastInsertId();
            } else {
                throw new Exception('Failed to create address');
            }
        }

        $personalInfoStmt = $this->pdo->prepare("INSERT INTO order_contact_info (contact_first_name, contact_last_name, contact_phone, contact_email) VALUES (?,?,?,?)");
        if ($personalInfoStmt->execute([$data['contact_first_name'], $data['contact_last_name'], $data['contact_phone'], $data['contact_email']])) {
            $personalInfoID = $this->pdo->lastInsertId();
        } else {
            throw new Exception('Failed to create personal info');
        }

        $stmt = $this->pdo->prepare("INSERT INTO orders (userID, paymentMethod, total, orderAddressID, deliveryMethod, order_contact_info_id) VALUES (?,?,?,?,?,?)");
        if ($stmt->execute([$data['userID'], $data['paymentMethod'], $data['total'], $addressID, $data['deliveryMethod'], $personalInfoID])) {
            $orderID = $this->pdo->lastInsertId();

            if (isset($data['orderItems'])) {
                foreach ($data['orderItems'] as $orderItem) {
                    $productCheckStmt = $this->pdo->prepare("SELECT COUNT(*) FROM products WHERE productID = ?");
                    $productCheckStmt->execute([$orderItem['productID']]);
                    if ($productCheckStmt->fetchColumn() == 0) {
                        throw new Exception('Invalid productID: ' . $orderItem['productID']);
                    }

                    $stmt = $this->pdo->prepare("INSERT INTO orderitem (orderID, productID, quantity) VALUES (?,?,?)");
                    $stmt->execute([$orderID, $orderItem['productID'], $orderItem['quantity']]);
                }
            }

            $this->pdo->commit();

            // fetch order
            $stmt = $this->pdo->prepare("SELECT * FROM orders WHERE orderID = ?");
            $stmt->execute([$orderID]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($order) {
                $stmt = $this->pdo->prepare("SELECT * FROM order_addresses WHERE orderAddressID = ?");
                $stmt->execute([$order['orderAddressID']]);
                $orderAddress = $stmt->fetch(PDO::FETCH_ASSOC);
                $order['orderAddress'] = $orderAddress;

                $stmt = $this->pdo->prepare("SELECT * FROM order_contact_info WHERE order_contact_info_id = ?");
                $stmt->execute([$order['order_contact_info_id']]);
                $orderContactInfo = $stmt->fetch(PDO::FETCH_ASSOC);
                $order['orderContactInfo'] = $orderContactInfo;
            }

            http_response_code(201);
            echo json_encode(['ok' => true, 'order' => $order]);
        } else {
            throw new Exception('Failed to create order');
        }
    } catch (Exception $e) {
        $this->pdo->rollBack();
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    }
}

    public function updateOrder($id): void
    {
        $stmt = $this->pdo->prepare("SELECT * FROM orders WHERE orderID = ?");
        $stmt->execute([$id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Order not found']);
            return;
        }

        $this->pdo->beginTransaction();

        $data = json_decode(file_get_contents('php://input'), true);

        try {
            // Update contact info
            $orderContactInfoID = null;
            if (isset($data['contact_first_name'], $data['contact_last_name'], $data['contact_phone'], $data['contact_email'])) {
                $stmt = $this->pdo->prepare("UPDATE order_contact_info SET contact_first_name = ?, contact_last_name = ?, contact_phone = ?, contact_email = ? WHERE order_contact_info_id = ?");
                $stmt->execute([$data['contact_first_name'], $data['contact_last_name'], $data['contact_phone'], $data['contact_email'], $order['order_contact_info_id']]);
                if ($stmt->rowCount() === 0) {
                    // Create contact info
                    $stmt = $this->pdo->prepare("INSERT INTO order_contact_info (contact_first_name, contact_last_name, contact_phone, contact_email) VALUES (?,?,?,?)");
                    if (!$stmt->execute([$data['contact_first_name'], $data['contact_last_name'], $data['contact_phone'], $data['contact_email']])) {
                        throw new Exception('Failed to create contact info');
                    }
                    $orderContactInfoID = $this->pdo->lastInsertId();
                }
            }

            // Update address
            $orderAddressID = null;
            if ($order['deliveryMethod'] === 'courier' && isset($data['street'], $data['city'], $data['zipcode'])) {
                $stmt = $this->pdo->prepare("UPDATE order_addresses SET street = ?, city = ?, zipcode = ? WHERE orderAddressID = ?");
                $stmt->execute([$data['street'], $data['city'], $data['zipcode'], $order['orderAddressID']]);
                if ($stmt->rowCount() === 0) {
                    // Create address
                    $stmt = $this->pdo->prepare("INSERT INTO order_addresses (street, city, zipcode) VALUES (?,?,?)");
                    if (!$stmt->execute([$data['street'], $data['city'], $data['zipcode']])) {
                        throw new Exception('Failed to create address');
                    }
                    $orderAddressID = $this->pdo->lastInsertId();
                }
            }

            // Update order
            if (isset($data['total'], $data['paymentMethod'], $data['deliveryMethod'])) {
                $stmt = $this->pdo->prepare("UPDATE orders SET total = ?, paymentMethod = ?, deliveryMethod = ?, orderAddressID = ?, order_contact_info_id = ? WHERE orderID = ?");
                if (!$stmt->execute([$data['total'], $data['paymentMethod'], $data['deliveryMethod'], $orderAddressID ?? $order['orderAddressID'], $orderContactInfoID ?? $order['order_contact_info_id'], $id])) {
                    throw new Exception('Failed to update order');
                }
            }

            $this->pdo->commit();
            http_response_code(200);
            echo json_encode(['ok' => true, 'success' => 'Order updated successfully']);
        } catch (Exception $e) {
            $this->pdo->rollBack();
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        }
    }

    public function deleteOrder($id): void
    {
        $stmt = $this->pdo->prepare("DELETE FROM orders WHERE orderID = ?");
        if ($stmt->execute([$id])) {
            http_response_code(200);
            echo json_encode(['ok' => true, 'status' => 'success', 'message' => 'Order deleted']);
        } else {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => 'Failed to delete order']);
        }
    }
}