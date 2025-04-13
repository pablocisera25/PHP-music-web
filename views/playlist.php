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
<h2>Lista de Favoritos</h2>

<?php if (!empty($error_message)): ?>
    <p>Error: <?= htmlspecialchars($error_message) ?></p>
<?php elseif (empty($all_music)): ?>
    <p>Aún no se han seleccionado favoritos</p>
<?php else: ?>
    <!-- Contenedor del reproductor -->
    <div id="player-container" style="display:none;">
        <div id="yt-player"></div>
        <div class="controls">
            <button id="pause-btn" disabled>⏸️</button>
            <button id="stop-btn" disabled>⏹️</button>
            <input type="range" id="volume-slider" min="0" max="100" value="50" disabled>
            <input type="range" id="seek-bar" min="0" max="100" value="0" disabled>
        </div>
    </div>

    <ul class="playlist">
        <?php foreach ($all_music as $index => $music): ?>
            <li class="playlist-item" data-url="<?= htmlspecialchars($music['url']) ?>">
                <img src="<?= $music['thumbnail'] ?>" alt="miniatura">
                <button class="start-btn">▶</button>
                <div class="info">
                    <h3><?= htmlspecialchars($music['title']) ?></h3>
                    <p><?= htmlspecialchars($music['channel']) ?></p>
                </div>
            </li>
        <?php endforeach; ?>
    </ul>

    <script src="https://www.youtube.com/iframe_api"></script>
    <script src="/public/js/playlist.js"></script>
<?php endif; ?>

