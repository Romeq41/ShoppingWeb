<?php

class Product
{
    private $pdo;

    public $productID;
    public $name;
    public $price;
    public $description;

    public $imageURL;

    public $stock;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    function getProducts(): array
    {

        $quantity = $_GET['quantity'] ?? '';
        $sortBy = $_GET['sortBy'] ?? 'name';
        $order = $_GET['order'] ?? 'ASC';

        $allowedSortFields = ['name', 'price', 'rating', 'created_at'];
        $allowedOrder = ['ASC', 'DESC'];

        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'name';
        }
        if (!in_array(strtoupper($order), $allowedOrder)) {
            $order = 'ASC';
        }


        if (!is_numeric($quantity)) {
            $stmt = $this->pdo->prepare("SELECT * FROM products ORDER BY $sortBy $order");
        }else{
            $stmt = $this->pdo->prepare("SELECT * FROM products ORDER BY $sortBy $order LIMIT $quantity");
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }



    function getProduct($id): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM products WHERE productID = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    function getSearchProducts(): array
    {
        $search = $_GET['search'] ?? '';
        $stmt = $this->pdo->prepare("SELECT * FROM products WHERE name LIKE ?");
        $stmt->bindValue(1, "%$search%");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    function createProduct(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->pdo->prepare("INSERT INTO products (name, description, price, imageURL, stock) VALUES (?, ?, ?, ?, ?)");
        if ($stmt->execute([$data['name'], $data['description'], $data['price'], $data['imageURL'], $data['stock']])) {
            echo json_encode(['success' => 'Product created successfully']);
        } else {
            echo json_encode(['error' => 'Failed to create product']);
        }
    }

    function updateProduct($id): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->pdo->prepare("UPDATE products SET name = ?, price = ?, description = ?, imageURL = ?,stock = ? WHERE productID = ?");
        if ($stmt->execute([$data['name'], $data['price'], $data['description'], $data['imageURL'], $data['stock'] , $id])) {
            echo json_encode(['success' => 'Product updated successfully']);
        } else {
            echo json_encode(['error' => 'Failed to update product']);
        }
    }

    function deleteProduct($id): void
    {
        $stmt = $this->pdo->prepare("DELETE FROM products WHERE productID = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(['status' => 'success', 'message' => 'Product deleted']);
        } else {
            echo json_encode(['error' => 'Failed to delete product']);
        }
    }
}