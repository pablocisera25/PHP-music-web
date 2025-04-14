<?php

session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../models/Music.php';

$userId = $_SESSION['user_data']['id'] ?? null;

if (!$userId) {
    echo json_encode([
        'success' => false,
        'message' => 'Usuario no autenticado'
    ]);
    exit;
}

$required = ['videoId', 'title', 'channel', 'thumbnail', 'url'];

foreach ($required as $field) {
    if (empty($_POST[$field])) {
        echo json_encode([
            'success' => false,
            'message' => "Falta el campo $field"
        ]);
        exit;
    }
}


$data = [
    'videoId' => $_POST['videoId'],
    'title' => $_POST['title'],
    'channel' => $_POST['channel'],
    'thumbnail' => $_POST['thumbnail'],
    'url' => $_POST['url'],
    'userId' => $userId
];

$music = new Music('saved_music');

try {
    $success = $music->saveMusic($data);

    echo json_encode([
        'success' => $success,
        'message' => $success ? `Lista de favoritos actualizada. Cancion:{$_POST['title']}` : 'No se pudo guardar'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar: ' . $e->getMessage()
    ]);
}
exit;