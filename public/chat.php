<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Load environment variables from .env file
if (file_exists('../.env')) {
    $lines = file('../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

$apiKey = $_ENV['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY');
$workflowId = $_ENV['WORKFLOW_ID'] ?? getenv('WORKFLOW_ID');

if (!$apiKey || !$workflowId) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuration missing (API Key or Workflow ID)']);
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
    echo $response;
}

curl_close($ch);
?>
