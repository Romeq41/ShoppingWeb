<?php
class Cart
{
    private $pdo;

    public $cartID;
    public $userID;
    public $total;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getCartByUserID($userID): ?Cart
    {
        $stmt = $this->pdo->prepare("SELECT * FROM cart WHERE userID = ?");
        $stmt->execute([$userID]);
        $cartData = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cartData) {
            $cart = new Cart($this->pdo);
            $cart->cartID = $cartData['cartID'];
            $cart->userID = $cartData['userID'];
            $cart->total = $cartData['total'];
            return $cart;
        } else {
            return null;
        }
    }

    public function getCart($id,$tokenVerificationRes): void
    {
        $stmt = $this->pdo->prepare("SELECT * FROM cart WHERE cartID = ?");
        $stmt->execute([$id]);
        $cart = $stmt->fetch(PDO::FETCH_ASSOC);

        if($cart['userID'] != $tokenVerificationRes->userID && $tokenVerificationRes->role != '1'){
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
            return;
        }

        if ($cart) {
            http_response_code(200);
            echo json_encode($cart);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Cart not found']);
        }
    }

    public function getCarts(): void
    {
        $quantity = $_GET['quantity'] ?? '0';
        $sortBy = $_GET['sortBy'] ?? 'cartID';
        $order = $_GET['order'] ?? 'ASC';

        $allowedSortFields = ['cartID', 'productID', 'quantity', 'userID'];
        $allowedOrder = ['ASC', 'DESC'];

        $quantity = is_numeric($quantity) ? (int) $quantity : 0;
        $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'cartID';
        $order = in_array(strtoupper($order), $allowedOrder) ? strtoupper($order) : 'ASC';

        $stmt = $this->pdo->prepare("SELECT * FROM cart ORDER BY $sortBy $order LIMIT ?");
        $stmt->execute([$quantity]);
        $carts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($carts) {
            http_response_code(200);
            echo json_encode($carts);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'No carts found']);
        }
    }

    public function createCart($tokenVerificationRes): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['userID'], $data['isGuest'])) {
            if($data['userID'] != $tokenVerificationRes->userID && $tokenVerificationRes->role != '1'){
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
                return;
            }
            $stmt = $this->pdo->prepare("INSERT INTO cart (userID, isGuest) VALUES (?, ?)");
            $stmt->execute([$data['userID'], $data['isGuest']]);

            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'Cart created successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid data provided']);
        }
    }

    public function updateCart($id,$tokenVerificationRes): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['total'], $data['userID'])) {
            $stmt = $this->pdo->prepare("SELECT userID FROM cart WHERE cartID = ?");
            $stmt->execute([$id]);
            $cart = $stmt->fetch(PDO::FETCH_ASSOC);

            if($cart['userID'] != $data['userID'] || $cart['userID'] != $tokenVerificationRes->userID && $tokenVerificationRes->role != '1'){
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
                return;
            }


            $stmt = $this->pdo->prepare("UPDATE cart SET total = ?, userID = ? WHERE cartID = ?");
            $stmt->execute([$data['total'], $data['userID'], $id]);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Cart updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid data provided']);
        }
    }

    public function removeCartItem($tokenVerificationRes): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['cartItemID'])) {

            $stmt = $this->pdo->prepare("SELECT userID FROM cart WHERE cartID = (SELECT cartID FROM cartItem WHERE cartItemID = ?)");
            $stmt->execute([$data['cartItemID']]);
            $cart = $stmt->fetch(PDO::FETCH_ASSOC);

            if($cart['userID'] != $tokenVerificationRes->userID && $tokenVerificationRes->role != '1'){
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
                return;
            }

            $stmt = $this->pdo->prepare("SELECT * FROM cartItem WHERE cartItemID = ?");
            $stmt->execute([$data['cartItemID']]);
            $cartItem = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$cartItem) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'CartItem not found']);
                return;
            }

            if ($cartItem['quantity'] > 1) {
                $stmt = $this->pdo->prepare("UPDATE cartItem SET quantity = quantity - 1 WHERE cartItemID = ?");
                $stmt->execute([$data['cartItemID']]);

                http_response_code(200);
                echo json_encode(['status' => 'success', 'message' => 'Removed 1 product from cart']);
                return;
            }else{
                $stmt = $this->pdo->prepare("DELETE FROM cartItem WHERE cartItemID = ?");
                $stmt->execute([$data['cartItemID']]);
            }

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'CartItem ' . $data['cartItemID'] . ' removed']);
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid data provided']);
        }
    }

    public function getCartItems(Cart $cartInfo): void
    {
        $cartID = $cartInfo->cartID;
        $stmt = $this->pdo->prepare("SELECT * FROM cartItem WHERE cartID = ?");

        if ($stmt->execute([$cartID])) {
            $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($cartItems && count($cartItems) > 0) {
                http_response_code(200);
                echo json_encode(['cart' => $cartInfo, 'cartItems' => $cartItems]);
            } else {
                http_response_code(203); // Query successful, but no items
                echo json_encode(['cart' => $cartInfo,'cartItems' => [] ,'status' => 'success', 'message' => 'No cart items found']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to retrieve cart items']);
        }
    }

    public function createCartItem($tokenVerificationRes): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['cartID'], $data['productID'])) {

            $stmt = $this->pdo->prepare("SELECT userID FROM cart WHERE cartID = ?");
            $stmt->execute([$data['cartID']]);
            $cart = $stmt->fetch(PDO::FETCH_ASSOC);

            if($cart['userID'] != $tokenVerificationRes->userID && $tokenVerificationRes->role != '1'){
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
                return;
            }

            $stmt = $this->pdo->prepare("SELECT * FROM cartItem WHERE cartID = ? AND productID = ?");
            $stmt->execute([$data['cartID'], $data['productID']]);
            $cartItem = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($cartItem) {
                $stmt = $this->pdo->prepare("UPDATE cartItem SET quantity = quantity + 1 WHERE cartItemID = ?");
                $stmt->execute([$cartItem['cartItemID']]);

                http_response_code(200);
                echo json_encode(['status' => 'success', 'message' => 'Added 1 more product to cart']);
                return;
            }

            $stmt = $this->pdo->prepare("INSERT INTO cartItem (cartID, productID) VALUES (?, ?)");
            $stmt->execute([$data['cartID'], $data['productID']]);

            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'CartItem created']);
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid data provided']);
        }
    }

    public function deleteCartItem($tokenVerificationRes): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['cartItemID'])) {
            $stmtm = $this->pdo->prepare("SELECT userID FROM cart WHERE cartID = (SELECT cartID FROM cartItem WHERE cartItemID = ?)");
            $stmtm->execute([$data['cartItemID']]);
            $cart = $stmtm->fetch(PDO::FETCH_ASSOC);

            if($cart['userID'] != $tokenVerificationRes->userID && $tokenVerificationRes->role != '1'){
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
                return;
            }

            $stmt = $this->pdo->prepare("DELETE FROM cartItem WHERE cartItemID = ?");
            $stmt->execute([$data['cartItemID']]);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'cartItem ' . $data['cartItemID'] . ' removed']);
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid data provided']);
        }
    }

    public function deleteCartItems($cartID,$tokenVerificationRes): void
    {
        $stmt = $this->pdo->prepare("SELECT userID FROM cart WHERE cartID = ?");
        $stmt->execute([$cartID]);
        $cart = $stmt->fetch(PDO::FETCH_ASSOC);

        if($cart['userID'] != $tokenVerificationRes->userID && $tokenVerificationRes->role != '1'){
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
            return;
        }

        $stmt = $this->pdo->prepare("DELETE FROM cartItem WHERE cartID = ?");
        $stmt->execute([$cartID]);

        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Cart items removed']);
    }
}