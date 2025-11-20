<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Helper to load env
function loadEnv($path) {
    if (!file_exists($path)) return false;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
    return true;
}

// Try loading from parent directory first (secure), then current directory
if (!loadEnv('../.env')) {
    loadEnv('.env');
}

$apiKey = $_ENV['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY');
$workflowId = $_ENV['WORKFLOW_ID'] ?? getenv('WORKFLOW_ID');

if (!$apiKey || !$workflowId) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Configuration missing',
        'details' => 'Could not find OPENAI_API_KEY or WORKFLOW_ID. Please check your .env file.'
    ]);
    exit;
}

// Get input (optional device ID or user ID)
$input = json_decode(file_get_contents('php://input'), true);
$deviceId = $input['deviceId'] ?? uniqid('user_', true);

$data = [
    'workflow' => ['id' => $workflowId],
    'user' => $deviceId
];

$ch = curl_init('https://api.openai.com/v1/chatkit/sessions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'OpenAI-Beta: chatkit_beta=v1',
    'Authorization: Bearer ' . $apiKey
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Curl error: ' . curl_error($ch)]);
} else {
    // Check for API errors in response
    $json = json_decode($response, true);
    if (isset($json['error'])) {
        http_response_code(500);
    }
    echo $response;
}

curl_close($ch);
?>
