<?php
session_start();
global $pdo;
require '../config/config.php';
require '../models/Product.php';
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

if ($tokenVerificationRes == null && ($method === 'POST' || $method === 'PUT' || $method === 'DELETE')) {
    http_response_code(402);
    echo json_encode(['error' => 'Unauthorized: No Token Found']);
    return;
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

$product = new Product($pdo);
switch ($method) {
    case 'GET':
        if (isset($request[0]) && is_numeric($request[0])) {
            $res = $product->getProduct($request[0]);
            if($res != null){
                echo json_encode($res);
                http_response_code(200);
            }else{
                http_response_code(404);
            }
        } else if (isset($_GET['search'])) {
            $res = $product->getSearchProducts();
            if($res != null) {
                echo json_encode($res);
                http_response_code(200);
            }else{
                http_response_code(404);
            }
        }else{
            $res = $product->getProducts();
            if($res != null) {
                echo json_encode($res);
                http_response_code(200);
            }else{
                http_response_code(404);
            }
        }
        break;
    case 'POST':
        if($tokenVerificationRes->role != '1') {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: Invalid User ID']);
            return;
        }

        $product->createProduct();
        http_response_code(201);
        break;
    case 'PUT':
        if($tokenVerificationRes->role != '1') {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: Invalid User ID']);
            return;
        }

        if (isset($request[0]) && is_numeric($request[0])) {
            $product->updateProduct($request[0]);
        } else {
            echo json_encode(['error' => 'Invalid Product ID']);
        }
        break;
    case 'DELETE':
        if($tokenVerificationRes->role != '1') {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: Invalid User ID']);
            return;
        }

        if (isset($request[0]) && is_numeric($request[0])) {
            $product->deleteProduct($request[0]);
        } else {
            echo json_encode(['error' => 'Invalid Product ID']);
        }
        break;
    default:
        echo json_encode(['error' => 'Invalid Request Method']);
}

