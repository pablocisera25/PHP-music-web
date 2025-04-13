<?php

require_once __DIR__ . '/../controllers/MusicController.php';

$musicController = new MusicController();
$all_music = [];

try {
    $all_music = $musicController->getAllMusics();
    
    print_r($all_music);
    
    exit;
} catch (Exception $e) {
    $error_message = $e->getMessage();
}
?>
