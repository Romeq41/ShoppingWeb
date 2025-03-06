<?php

class Address
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getUserAddress($userID): void
    {
        $stmt = $this->pdo->prepare("SELECT * FROM address WHERE userID = ?");
        $stmt->execute([$userID]);
        $addresses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($addresses);
    }

    public function createAddress(): ?bool
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->pdo->prepare("INSERT INTO address (street, city, zipcode, userID) VALUES (?, ?, ?, ?)");
        if ($stmt->execute([$data['street'], $data['city'],  $data['zipcode'], $data['userID']])) {
            echo json_encode($this->pdo->lastInsertId());
            return true;
        } else {
            echo json_encode(['error' => 'Failed to create address']);
            return null;
        }
    }

    public function updateAddress($id,$authToken): bool
    {
        $stmt = $this->pdo->prepare("SELECT * FROM address WHERE addressID = ?");
        $stmt->execute([$id]);
        $address = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($address['userID'] != $authToken->userID && $authToken->role != '1') {
            echo json_encode(['error' => 'Unauthorized: Invalid User ID']);
            return false;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->pdo->prepare("UPDATE address SET street = ?, city = ?, zipcode = ? WHERE addressID = ?");
        if ($stmt->execute([$data['street'], $data['city'], $data['zipcode'], $id])) {
            echo json_encode(['success' => 'Address updated successfully']);
            return true;
        } else {
            echo json_encode(['error' => 'Failed to update address']);
            return false;
        }
    }

    public function deleteAddress($id,$authToken): bool
    {
        $stmt = $this->pdo->prepare("SELECT * FROM address WHERE addressID = ?");
        $stmt->execute([$id]);
        $address = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($address['userID'] != $authToken->userID && $authToken->role != '1') {
            echo json_encode(['error' => 'Unauthorized: Invalid User ID', 'address' => $address['userID'], 'token' => $authToken->userID]);
            return false;
        }


        $stmt = $this->pdo->prepare("DELETE FROM address WHERE addressID = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(['success' => 'Address deleted successfully']);
            return true;
        } else {
            echo json_encode(['error' => 'Failed to delete address']);
            return false;
        }
    }

}