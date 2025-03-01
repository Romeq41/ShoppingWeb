<?php

class Favorite
{

    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getFavoriteProduct($id): void
    {
        $stmt = $this->pdo->prepare("SELECT * FROM favoriteproducts WHERE favoriteProductID = ?");
        $stmt->execute([$id]);
        $favorite = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($favorite) {
            echo json_encode($favorite);
        } else {
            echo json_encode(['message' => 'Favorite not found']);
        }
    }

    public function getFavoriteProducts(): void
    {
        $quantity = $_GET['quantity'] ?? '0';
        $sortBy = $_GET['sortBy'] ?? 'favoriteProductID';
        $order = $_GET['order'] ?? 'ASC';

        $allowedSortFields = ['favoriteProductID', 'productID', 'userID'];
        $allowedOrder = ['ASC', 'DESC'];

        $quantity = is_numeric($quantity) ? (int) $quantity : 0;
        $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'favoriteProductID';
        $order = in_array(strtoupper($order), $allowedOrder) ? strtoupper($order) : 'ASC';

        $stmt = $this->pdo->prepare("SELECT * FROM favoriteproducts ORDER BY $sortBy $order LIMIT ?");
        $stmt->execute([$quantity]);
        $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($favorites);
    }

    public function getFavoriteByUserID($userID): ?FavoriteProduct
    {
        $stmt = $this->pdo->prepare("SELECT * FROM favoriteproducts WHERE userID = ?");
        $stmt->execute([$userID]);
        $favoriteData = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($favoriteData) {
            $favorite = new FavoriteProduct($this->pdo);
            $favorite->favoriteID = $favoriteData['favoriteID'];
            $favorite->productID = $favoriteData['productID'];
            $favorite->userID = $favoriteData['userID'];
            return $favorite;
        } else {
            return null;
        }
    }

    public function createFavoriteProduct(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->pdo->prepare("INSERT INTO favoriteproducts (productID, userID) VALUES (?, ?)");
        if ($stmt-> execute([$data['productID'], $data['userID']])) {
            echo json_encode(['success' => 'Favorite created successfully']);
        } else {
            echo json_encode(['error' => 'Failed to create favorite']);
        }
    }

    public function deleteFavoriteProduct($id): void
    {
        $stmt = $this->pdo->prepare("DELETE FROM favoriteproducts WHERE favoriteProductID = ? AND userID = ?");
        if ($stmt->execute([$id, $_SESSION['userID']])) {
            echo json_encode(['success' => 'Favorite deleted successfully']);
        } else {
            echo json_encode(['error' => 'Failed to delete favorite']);
        }
    }

    public function deleteFavoriteByUserID($userID): void
    {
        $stmt = $this->pdo->prepare("DELETE FROM favoriteproducts WHERE userID = ?");
        if ($stmt->execute([$userID])) {
            echo json_encode(['success' => 'Favorite deleted successfully']);
        } else {
            echo json_encode(['error' => 'Failed to delete favorite']);
        }
    }

}