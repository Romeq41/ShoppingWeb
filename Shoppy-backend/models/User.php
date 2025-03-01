<?php
require 'JWT.php';
$env = require '../config/env.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../vendor/autoload.php';
class User
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllUsers(): array
    {
        $stmt = $this->pdo->query("SELECT * FROM users");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUsers(): array
    {
        $stmt = $this->pdo->query("SELECT * FROM users where role = 0");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUser($id): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE userID = ?");
        $stmt->execute([trim($id)]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function loginUser(): ?array
    {
        $env = require '../config/env.php';
        $secret = $env['JWT_SECRET_KEY'];

        $data = json_decode(file_get_contents('php://input'), true);
        $data['email'] = trim($data['email']);
        $data['password'] = trim($data['password']);

        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($data['password'], $user['password'])) {
            // Generate JWT token
            $jwt = new JWT($secret);
            $token = $jwt->encode([
                'userID' => $user['userID'],
                'role' => $user['role'],
                'username' => $user['username'],
                'email' => $user['email'],
                'exp' => time() + 3600 // 1 hour
            ]);

            // Store the token in a cookie
            $cookieSet = setcookie(
                'auth_token', // Cookie name
                $token,       // Cookie value
                time() + 3600, // Expiry time (1 hour)
                '/',          // Path
                'localhost',  // Domain
                false,        // Secure (set to false for local development)
                true          // HttpOnly
            );

            $_COOKIE['auth_token'] = $token;
            $_SESSION['auth_token'] = $token;


            if($user['role'] == 1) {
                $_SESSION['admin'] = true;
            }

            // Log the result of setcookie
            error_log("Cookie set: " . ($cookieSet ? 'true' : 'false'));

            // Return user data (excluding the token) back to the frontend
            return [
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'userID' => $user['userID'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]
            ];
        } else {
            // Handle invalid credentials
            return ['error' => 'Invalid email or password'];
        }
    }

    public function verifyToken(): ?object
    {
        $env = require '../config/env.php';
        $secret = $env['JWT_SECRET_KEY'];

        if (isset($_COOKIE['auth_token'])) {
            $jwt = new JWT($secret);
            $decoded = $jwt->decode($_COOKIE['auth_token']);

            error_log("Decoded Token: " . print_r($decoded, true));

            if ($decoded && $decoded->exp > time()) {
                // Log token validity
                error_log("Token is valid");
                return $decoded;
            } else {
                // Log token invalidity
                error_log("Token is invalid or expired");
            }
        } else {
            // Log missing token
            error_log("auth_token cookie is not set");
        }
        return null;
    }

    public function verifyCsrfToken(): ?array
    {
        $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'];
        if (!isset($csrfToken) || $csrfToken !== $_SESSION['csrf_token']) {
            return null;
        }
        return ['success' => 'CSRF Token is valid'];
    }

    public function logoutUser(): array
    {
        session_destroy();
        $res = setcookie('auth_token', '', time() - 3600, '/', '', false, true);
        return ['success' => $res, 'message' => 'User logged out'];
    }

    public function createUser(): ?array
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $data['email'] = trim($data['email']);
        $data['username'] = trim($data['username']);
        $data['password'] = trim($data['password']);

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return ['error' => 'Invalid email'];
        }

        if (strlen($data['password']) < 8) {
            return ['error' => 'Password must be at least 8 characters long'];
        }

        if(empty($data['username'])) {
            return ['error' => 'Username cannot be empty'];
        }

        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$data['email'], $data['username']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            return ['error' => 'User already exists'];
        }

        $encryptedPasswd = password_hash($data['password'], PASSWORD_BCRYPT);
        $currentTimestamp = date('Y-m-d H:i:s');
        $stmt = $this->pdo->prepare("INSERT INTO users (email, password, created_at, updated_at, username) VALUES (?, ?, ?, ?, ?)");
        if ($stmt->execute([$data['email'], $encryptedPasswd, $currentTimestamp, $currentTimestamp, $data['username']])) {
            $userID = $this->pdo->lastInsertId();


            //create cart for user
            $stmt = $this->pdo->prepare("INSERT INTO cart (userID, isGuest) VALUES (?, ?)");
            $stmt->execute([$userID, 0]);

            return ['success' => 'User created successfully'];
        } else {
            return ['error' => 'Failed to create user'];
        }
    }

    public function updateUser($id): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE userID = ?");
        $stmt->execute([trim($id)]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            return ['error' => 'User not found'];
        }

        $data = json_decode(file_get_contents('php://input'), true);

        $updatedUser = $user;
        if (isset($data['username'])) {
            $updatedUser['username'] = trim($data['username']);
        }
        if (isset($data['email'])) {
            $updatedUser['email'] = trim($data['email']);
        }
        if (isset($data['firstname'])) {
            $updatedUser['firstname'] = trim($data['firstname']);
        }
        if (isset($data['lastname'])) {
            $updatedUser['lastname'] = trim($data['lastname']);
        }
        if (isset($data['phone'])) {
            $updatedUser['phone'] = trim($data['phone']);
        }

        $stmt = $this->pdo->prepare("UPDATE users SET username = ?, email = ?, firstname = ?, lastname = ?, phone = ? WHERE userID = ?");
        if ($stmt->execute([$updatedUser['username'], $updatedUser['email'], $updatedUser['firstname'], $updatedUser['lastname'], $updatedUser['phone'], $id])) {
            return ['success' => 'User updated successfully', 'data' => $updatedUser];
        } else {
            return ['error' => 'Failed to update user'];
        }
    }

    function sendGeneratedPassword() {
        $data = json_decode(file_get_contents('php://input'), true);
        $data['email'] = trim($data['email']);

        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['error' => 'User not found'];
        }

        $newPassword = bin2hex(random_bytes(8));
        $encryptedPasswd = password_hash($newPassword, PASSWORD_BCRYPT);
        $stmt = $this->pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
        if ($stmt->execute([$encryptedPasswd, $data['email']])){
            return $this->sendMail($data['email'], 'Password Reset', 'Your new password is: ' . $newPassword);
        } else {
            return ['error' => 'Failed to update password'];
        }
    }

    public function changePassword($id): array
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $data['password'] = trim($data['password']);
        $data['newPassword'] = trim($data['newPassword']);

        if (strlen($data['newPassword']) < 8) {
            return ['error' => 'Password must be at least 8 characters long'];
        }

        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE userID = ?");
        $stmt->execute([trim($id)]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['error' => 'User not found'];
        }
        if (!password_verify($data['password'], $user['password'])) {
            return ['error' => 'Current password is incorrect'];
        }

        $encryptedPasswd = password_hash($data['newPassword'], PASSWORD_BCRYPT);
        $stmt = $this->pdo->prepare("UPDATE users SET password = ? WHERE userID = ?");
        if ($stmt->execute([$encryptedPasswd, $id])) {
            return ['success' => 'Password updated successfully'];
        } else {
            return ['error' => 'Failed to update password'];
        }
    }

    public function deleteUser($id): array
    {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE userID = ?");
        if ($stmt->execute([trim($id)])) {
            return ['status' => 'success', 'message' => 'User deleted: ' . $id];
        } else {
            return ['error' => 'Failed to delete user'];
        }
    }

    public function sendMail($email, $subject, $message): array
    {
        $env = require '../config/env.php';
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = $env['Host'];
            $mail->SMTPAuth = true;
            $mail->Username =  $env['Username'];
            $mail->Password = $env['Password'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port = $env['Port'];

            // Recipients
            $mail->setFrom($env('Username'), 'Password Generator');
            $mail->addAddress(trim($email));

            // Content
            $mail->isHTML();
            $mail->Subject = $subject;
            $mail->Body = $message;

            $mail->send();
            return ['success' => 'Mail sent successfully to ' . $email];
        } catch (Exception $e) {
            return ['error' => "Failed to send mail. Mailer Error: {$mail->ErrorInfo}, " . $e->getMessage()];
        }
    }
}