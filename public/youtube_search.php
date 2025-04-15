<?php
require_once __DIR__ . '/../core/search_youtube.php';
$config = require __DIR__ . '/../config/config.php';

header('Content-Type: application/json');

$API_KEY = $config['API_KEY'] ?? '';
if (empty($API_KEY)) {
    echo json_encode(['error' => 'API_KEY no configurada']);
    exit;
}

$query = $_GET['query'] ?? '';
$maxResults = $_GET['maxResults'] ?? 3;

if (empty($query)) {
    echo json_encode(['error' => 'Falta parámetro de búsqueda']);
    exit;
}

$youtube = new YoutubeSearch($API_KEY);
$results = $youtube->search($query, $maxResults);
echo json_encode($results);
