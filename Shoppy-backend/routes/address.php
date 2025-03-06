<?php
session_start();
global $pdo;
require '../config/config.php';
require '../models/Address.php';
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
if($tokenVerificationRes == null){
    http_response_code(401);
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

$address = new Address($pdo);
switch ($method) {
    case 'GET':
        if (isset($request[0]) && is_numeric($request[0]) && $request[0] == $tokenVerificationRes->userID || $tokenVerificationRes->role == '1') {
            $address->getUserAddress($request[0]);
            http_response_code(200);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or missing user ID']);
        }
        break;
    case 'POST':
        $res = $address->createAddress();
        if ($res) {
            http_response_code(201);
        } else {
            http_response_code(400);
        }
        break;
    case 'PUT':
        if (isset($request[0]) && is_numeric($request[0])) {
            $res = $address->updateAddress($request[0], $tokenVerificationRes);
            if ($res) {
                http_response_code(200);
            } else {
                http_response_code(400);
            }
        } else {
            echo json_encode(['error' => 'Invalid Address ID']);
        }
        break;
    case 'DELETE':
        if (isset($request[0]) && is_numeric($request[0])) {
            $res = $address->deleteAddress($request[0], $tokenVerificationRes);
            if ($res) {
                http_response_code(200);
            } else {
                http_response_code(400);
            }
        } else {
            echo json_encode(['error' => 'Invalid Address ID' . $request[0]]);
        }
        break;
    default:
        echo json_encode(['error' => 'Invalid Request Method']);
}