<?php
require_once __DIR__ . '/../core/search_youtube.php';
$config = require __DIR__ . '/../config/config.php';

$API_KEY = $config['API_KEY'] ?? '';
if (empty($API_KEY)) die('Error: API_KEY no configurada');

$youtube = new YoutubeSearch($API_KEY);
$results = [];
$error = null;

if (isset($_GET['q'])) {
    try {
        $results = $youtube->search($_GET['q']);
    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}
?>

<link rel="stylesheet" href="/public/css/search.css">
<link rel="stylesheet" href="/public/css/player-card.css">

<div class="search-music">
    <h1>Buscar música</h1>

    <form class="search-form" method="get">
        <input type="hidden" name="page" value="search">
        <input type="text" name="q" placeholder="Buscar artistas o canciones..."
            value="<?= htmlspecialchars($_GET['q'] ?? '') ?>">
        <button type="submit">Buscar</button>
    </form>

    <?php if (!empty($error)): ?>
        <div class="error-message"><?= htmlspecialchars($error) ?></div>
    <?php endif ?>

    <div class="music-grid">
        <?php foreach ($results as $result): ?>
            <div class="music-card" data-video-id="<?= $result['videoId'] ?>">
                <div class="card-thumbnail">
                    <img src="<?= $result['thumbnail'] ?>" alt="<?= htmlspecialchars($result['title']) ?>">
                </div>
                <div class="card-body">
                    <h3 class="card-title"><?= htmlspecialchars($result['title']) ?></h3>
                    <span class="card-channel"><?= htmlspecialchars($result['channel']) ?></span>
                    <div class="card-footer">
                        <a href="<?= $result['url'] ?>" class="youtube-link" target="_blank">YouTube</a>
                        <button class="play-btn">Reproducir</button>
                    </div>
                </div>
            </div>
        <?php endforeach ?>
    </div>

    <div id="youtube-player" style="display: none;"></div>
    
    <!-- Reproductor personalizado -->
    <div id="player-container">
        <div id="player-content">
            <div id="player-top">
                <div id="player-info">
                    <div id="now-playing">No hay reproducción</div>
                    <div id="player-channel"></div>
                </div>
                <button id="favorite-btn" class="player-btn" title="Añadir a favoritos">📁</button>
            </div>
            <div id="player-controls">
                <button id="play-pause-btn" class="player-btn">▶</button>
                <div id="progress-container">
                    <div id="progress-bar"></div>
                </div>
                <div id="time-display">0:00 / 0:00</div>
                <div id="volume-control">
                    <button id="mute-btn" class="player-btn">🔊</button>
                    <input type="range" id="volume-slider" min="0" max="100" value="50">
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://www.youtube.com/iframe_api"></script>

<script src="/public/js/player_card.js"></script>
