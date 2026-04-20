<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

$confirmation_code = strtoupper(substr(md5(uniqid()), 0, 8));
$status_url = "https://artyomshamshurin18-cmyk.github.io/gastroprime/facebook-callback/deletion-status.html?code=" . $confirmation_code;

echo json_encode([
    "url" => $status_url,
    "confirmation_code" => $confirmation_code
]);
?>