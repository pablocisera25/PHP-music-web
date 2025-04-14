<?php
require_once __DIR__ . '/../controllers/MusicController.php';

$musicController = new MusicController();
$all_music = [];

try {
    $all_music = $musicController->getAllMusics();
} catch (Exception $e) {
    $error_message = $e->getMessage();
}
?>

<link rel="stylesheet" href="/public/css/playlist.css">

<div class="playlist-container">
    <h1>Lista de favoritos</h1>

    <?php if (!empty($error_message)): ?>
        <div class="error-message"><?= htmlspecialchars($error_message) ?></div>
    <?php endif ?>

    <div class="scrollable-list">
        <ul class="music-list">
            <?php foreach ($all_music as $music): ?>
                <li class="music-item" data-video-id="<?= $music['video_id'] ?>">
                    <div class="item-thumbnail">
                        <img src="<?= $music['thumbnail'] ?>" alt="<?= htmlspecialchars($music['title']) ?>">
                    </div>
                    <div class="item-info">
                        <h3><?= htmlspecialchars($music['title']) ?></h3>
                        <p><?= htmlspecialchars($music['channel']) ?></p>
                    </div>
                    <div class="item-player">
                        <button class="mini-play-btn">▶</button>
                        <div class="mini-progress-container">
                            <div class="mini-progress-bar"></div>
                        </div>
                        <div class="mini-time-display">0:00</div>
                        <div class="mini-volume-control">
                            <input type="range" class="mini-volume-slider" min="0" max="100" value="50">
                        </div>
                    </div>
                </li>
            <?php endforeach ?>
        </ul>
    </div>

</div>

<div id="youtube-player" style="display: none;"></div>

<script src="https://www.youtube.com/iframe_api"></script>
<script src="/public/js/playlist-player.js"></script>