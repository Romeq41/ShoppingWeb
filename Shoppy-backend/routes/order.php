<?php
session_start();
global $pdo;
require '../config/config.php';
require '../models/Order.php';
require '../models/User.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';
$request = explode('/', trim($path, '/'));

$User = new User($pdo);
$tokenVerificationRes = $User->verifyToken();


if($method === 'PUT' || $method === 'DELETE') {
    if($tokenVerificationRes->role != '1') {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Invalid Role']);
        return;
    }
}

if($method !== 'GET') {
    $csrfTokenRes = $User->verifyCsrfToken();
    if ($csrfTokenRes === null) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized: No CSRF Token Found']);
        echo $csrfTokenRes;
        return;
    }
}


$order = new Order($pdo);
switch ($method) {
    case 'GET':
        if (isset($request[0]) && $request[0] === 'user' && isset($request[1]) && is_numeric($request[1])) {
            if($request[1] != $tokenVerificationRes->userID) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized: Invalid User ID']);
                return;
            }
            $order->getOrdersByUserID($request[1]);
        } else if (isset($request[0]) && is_numeric($request[0])) {
            if (isset($request[1]) && $request[1] === 'items') {
                $order->getOrderWithItems($request[0], $tokenVerificationRes->userID);
            } else {
                $order->getOrder($request[0], $tokenVerificationRes);
            }
        }else{
            if($tokenVerificationRes->role != '1') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized: Invalid User ID']);
                return;
            }
            $order->getOrders();
        }
        break;
    case 'POST':
        $order->createOrder();
        break;
    case 'PUT':
        if (isset($request[0]) && is_numeric($request[0])) {
            $order->updateOrder($request[0]);
        } else {
            echo json_encode(['error' => 'Invalid Product ID']);
        }
        break;
    case 'DELETE':
        if (isset($request[0]) && is_numeric($request[0])) {
            $order->deleteOrder($request[0]);
        } else {
            echo json_encode(['error' => 'Invalid Product ID']);
        }
        break;
    default:
        echo json_encode(['error' => 'Invalid Request Method']);
}

