<?php

class cartItem
{

    private $pdo;

    public $cartItemID;
    public $cartID;
    public $productID;
    public $quantity;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getCartItem($id): void
    {
        $stmt = $this->pdo->prepare("SELECT * FROM cartItem WHERE cartItemID = ?");
        $stmt->execute([$id]);
        $cartItem = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cartItem) {
            echo json_encode($cartItem);
        } else {
            echo json_encode(['message' => 'CartItem not found']);
        }
    }

    public function getCartItems($cartID): void
    {
        $quantity = $_GET['quantity'] ?? '0';
        $sortBy = $_GET['sortBy'] ?? 'cartItemID';
        $order = $_GET['order'] ?? 'ASC';

        $allowedSortFields = ['cartItemID', 'cartID', 'productID', 'quantity'];
        $allowedOrder = ['ASC', 'DESC'];

        $quantity = is_numeric($quantity) ? (int) $quantity : 0;
        $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'cartItemID';
        $order = in_array(strtoupper($order), $allowedOrder) ? strtoupper($order) : 'ASC';

        $stmt = $this->pdo->prepare("SELECT * FROM cartItem ORDER BY $sortBy $order LIMIT ? WHERE cartID = ?");
        $stmt->execute([$quantity]);
        $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($cartItems) {
            echo json_encode($cartItems);
        } else {
            echo json_encode(['message' => 'No cartItems found']);
        }
    }
}