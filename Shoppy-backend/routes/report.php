<?php

session_start();
global $pdo;
require '../config/config.php';
require '../models/Report.php';
require '../models/User.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';
$request = explode('/', trim($path, '/'));

$product = new Report($pdo);

$User = new User($pdo);

if($method !== 'GET') {
    $csrfTokenRes = $User->verifyCsrfToken();
    if ($csrfTokenRes === null) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: No CSRF Token Found']);
        return;
    }
}

if($method != 'POST') {
    $tokenVerificationRes = $User->verifyToken();
    if ($tokenVerificationRes == null) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: No Token Found']);
        return;
    }

    if($tokenVerificationRes->role != '1') {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Invalid User ID']);
        return;
    }
}

switch ($method) {
    case 'GET':
        if (isset($request[0]) && is_numeric($request[0])) {
            $product->getReport($request[0]);
        } else {
            $product->getReports();
        }
        break;
    case 'POST':
        $product->createReport();
        break;
    case 'PUT':
        if (isset($request[0]) && is_numeric($request[0])) {
            $product->updateReport($request[0]);
        } else {
            echo json_encode(['error' => 'Invalid Product ID']);
        }
        break;
    case 'DELETE':
        if (isset($request[0]) && is_numeric($request[0])) {
            $product->deleteReport($request[0]);
        } else {
            echo json_encode(['error' => 'Invalid Product ID']);
        }
        break;
    default:
        echo json_encode(['error' => 'Invalid Request Method']);
}

