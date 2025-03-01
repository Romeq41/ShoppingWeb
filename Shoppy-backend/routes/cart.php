<?php
session_start();
global $pdo;
require '../config/config.php';
require '../models/Cart.php';
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

if($method !== 'GET') {
    $csrfTokenRes = $User->verifyCsrfToken();
    if ($csrfTokenRes === null) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized: No CSRF Token Found']);
        echo $csrfTokenRes;
        return;
    }
}else{
    if($tokenVerificationRes == null){
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: No Token Found']);
        return;
    }
}

$cart = new Cart($pdo);

switch ($method) {
    case 'GET':
        if (!empty($request[0]) && isset($request[1]) && $request[1] === 'getAll' && $request[0] == $tokenVerificationRes->userID || $tokenVerificationRes->role == '1') {
            $cartInfo = $cart->getCartByUserID($request[0]);
            if($cartInfo){
                $cart->getCartItems($cartInfo);
            } else {
                echo json_encode(['message' => 'Cart not found']);
            }
        } elseif (!empty($request[0])) {
            $cart->getCart($request[0],$tokenVerificationRes);
        } else {
            $cart->getCarts();
        }
        break;
    case 'POST':
        if(isset($request[0]) && $request[0] === 'create'){
            $cart->createCart($tokenVerificationRes);
        } else if ($request[0] === 'addItem') {
            $cart->createCartItem($tokenVerificationRes);
        } else if ($request[0] === 'removeItem'){
            $cart->removeCartItem($tokenVerificationRes);
        }else{
            echo json_encode(['error' => 'Invalid Request']);
        }
        break;
    case 'PUT':
        if (isset($request[0]) && is_numeric($request[0])) {
            $cart->updateCart($request[0],$tokenVerificationRes);
        } else {
            echo json_encode(['error' => 'Invalid Cart ID']);
        }
        break;
    case 'DELETE':
        if (isset($request[0]) && is_numeric($request[0])) {
            $cart->deleteCartItems($request[0],$tokenVerificationRes);
        }else if(isset($request[0]) && $request[0] === 'removeItem'){
            $cart->deleteCartItem($tokenVerificationRes);
        } else {
            echo json_encode(['error' => 'Invalid Cart ID']);
        }
        break;
    default:
        echo json_encode(['error' => 'Invalid Request Method']);
}