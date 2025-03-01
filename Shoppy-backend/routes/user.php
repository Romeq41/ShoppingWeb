<?php
session_start();

header('Access-Control-Allow-Origin: http://localhost:63342');
header('Content-Type: application/json');
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

global $pdo;
require '../config/config.php';
require '../models/User.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';
$request = explode('/', trim($path, '/'));

$User = new User($pdo);
$tokenVerificationRes = $User->verifyToken();
if ($tokenVerificationRes == null && !($method === 'POST' || ($method === 'PUT' && isset($request[0]) && $request[0] === 'generatePassword'))) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized: No Token Found']);
    return;
}

if($method !== 'GET') {
    $csrfTokenRes = $User->verifyCsrfToken();
    if ($csrfTokenRes === null) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: No CSRF Token Found']);
        return;
    }
}


switch ($method) {
    case 'GET':
        if (isset($request[0]) && $request[0] === 'AllUsers') {
            if($tokenVerificationRes->role != '1') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized: Invalid User ID']);
                return;
            }


            $users = $User->getUsers();
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $users]);
        } else if (isset($request[0]) && is_numeric($request[0])) {
            if($request[0] !== $tokenVerificationRes->userID && $tokenVerificationRes->role != '1') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized: Invalid User ID']);
                return;
            }

            $user = $User->getUser($request[0]);
            if ($user) {
                http_response_code(200);
                echo json_encode(['success' => true, 'data' => $user]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        } else {
            $user = $User->getUser($tokenVerificationRes->userID);
            if ($user) {
                http_response_code(200);
                echo json_encode(['success' => true, 'data' => $user]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        }
        break;
    case 'POST':
        if (isset($request[0]) && $request[0] === 'login') {
            $response = $User->loginUser();
            if (isset($response['success'])) {
                http_response_code(200);
            } else {
                http_response_code(401);
            }
            echo json_encode($response);
        } else if (isset($request[0]) && $request[0] === 'logout') {
            $csrfTokenRes = $User->verifyCsrfToken();
            $response = $User->logoutUser();
            http_response_code(200);
            echo json_encode($response);
        } else if (isset($request[0]) && $request[0] === 'register') {
            $response = $User->createUser();
            if (isset($response['success'])) {
                http_response_code(201);
            } else {
                http_response_code(400);
            }
            echo json_encode($response);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid Request']);
        }
        break;
    case 'PUT':
        if (isset($request[0]) && is_numeric($request[0])) {
            if($request[0] != $tokenVerificationRes->userID && $tokenVerificationRes->role != '1') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized: Invalid User ID']);
            }

            $response = $User->updateUser($request[0]);
            if (isset($response['success'])) {
                http_response_code(200);
            } else {
                http_response_code(400);
            }
            echo json_encode($response);
        } else if(isset($request[0]) && $request[0] === 'generatePassword') {
            $response = $User->sendGeneratedPassword();
            if (isset($response['success'])) {
                http_response_code(200);
            } else {
                http_response_code(400);
            }
            echo json_encode($response);
        } else if (isset($request[0]) && $request[0] === 'changePassword' && isset($request[1]) && is_numeric($request[1])) {
            if($request[1] != $tokenVerificationRes->userID) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized: Invalid User ID']);
                return;
            }

            $response = $User->changePassword($request[1]);
            if (isset($response['success'])) {
                http_response_code(200);
            } else {
                http_response_code(400);
            }
            echo json_encode($response);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid User ID']);
        }
        break;
    case 'DELETE':
        if (isset($request[0]) && is_numeric($request[0])) {
            if($tokenVerificationRes->role != '1') {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized: Invalid User ID']);
                return;
            }

            $response = $User->deleteUser($request[0]);
            if (isset($response['status'])) {
                http_response_code(200);
            } else {
                http_response_code(400);
            }
            echo json_encode($response);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid User ID']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Invalid Request Method']);
}