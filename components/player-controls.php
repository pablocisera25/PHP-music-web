<!-- public/components/player-controls.php -->
<div id="player-controls" style="display: none;">
    <div class="player-container">
        <div class="now-playing">
            <img id="current-thumbnail" src="" alt="Miniatura" class="thumbnail-small">
            <div class="track-info">
                <div id="current-title" class="track-title">Selecciona una canción</div>
                <div id="current-channel" class="track-channel">Artista</div>

                <!-- guardar -->
                <form class="save-form-player" method="post">
                    <input type="hidden" name="videoId" value="<?= $result['videoId'] ?>">
                    <input type="hidden" name="title" value="<?= htmlspecialchars($result['title']) ?>">
                    <input type="hidden" name="channel" value="<?= htmlspecialchars($result['channel']) ?>">
                    <input type="hidden" name="thumbnail" value="<?= $result['thumbnail'] ?>">
                    <input type="hidden" name="url" value="<?= $result['url'] ?>">

                    <button class="save-btn" type="submit">
                        ❤️
                    </button>
                </form>
            </div>
        </div>

        <div class="progress-container">
            <div id="progress-bar" class="progress-bar">
                <div id="progress" class="progress"></div>
            </div>
            <div class="time-display">
                <span id="current-time">0:00</span>
                <span id="duration">0:00</span>
            </div>
        </div>

        <div class="control-buttons">
            <button id="rewind-btn" class="control-btn" title="Retroceder 10 segundos">⏪</button>
            <button id="play-pause-btn" class="control-btn" title="Reproducir/Pausa">▶️</button>
            <button id="forward-btn" class="control-btn" title="Avanzar 10 segundos">⏩</button>
            <button id="stop-btn" class="control-btn" title="Detener">⏹️</button>
            <button id="restart-btn" class="control-btn" title="Reiniciar">🔄</button>
            <button id="mute-btn" class="control-btn" title="Silenciar">🔊</button>
            <div class="volume-control">
                <input type="range" id="volume-slider" min="0" max="100" value="50" class="volume-slider">
            </div>
        </div>
    </div>

    <script src="/public/js/player-controls.js"></script>
    <script src="/public/js/save-music-player.js"></script>

    <style>
        /* Estilos para los controles */
        #player-controls {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #1f1f23;
            padding: 1rem;
            border-top: 1px solid #3a3a4a;
            z-index: 1000;
            box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.3);
        }

        .player-container {
            max-width: 800px;
            margin: 0 auto;
        }

        .now-playing {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
        }

        .thumbnail-small {
            width: 50px;
            height: 50px;
            border-radius: 4px;
            margin-right: 1rem;
            object-fit: cover;
        }

        .track-title {
            font-weight: 600;
            color: white;
            margin-bottom: 0.25rem;
            font-size: 1rem;
        }

        .track-channel {
            font-size: 0.8rem;
            color: #a5a5b8;
        }

        .progress-container {
            margin-bottom: 1rem;
        }

        .progress-bar {
            height: 6px;
            background: #3a3a4a;
            border-radius: 3px;
            cursor: pointer;
            margin-bottom: 0.5rem;
            position: relative;
        }

        .progress {
            height: 100%;
            background: #9147ff;
            border-radius: 3px;
            width: 0%;
            transition: width 0.3s ease;
        }

        .time-display {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            color: #a5a5b8;
        }

        .control-buttons {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
        }

        .control-btn {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            transition: transform 0.2s;
            padding: 0.5rem;
        }

        .control-btn:hover {
            transform: scale(1.1);
            color: #9147ff;
        }

        .control-btn:active {
            transform: scale(0.95);
        }

        /* Agregar estos estilos en la sección <style> */
        .volume-control {
            display: flex;
            align-items: center;
            margin-left: 1rem;
        }

        .volume-slider {
            width: 80px;
            height: 6px;
            -webkit-appearance: none;
            background: #3a3a4a;
            border-radius: 3px;
            outline: none;
            opacity: 0.7;
            transition: opacity 0.2s;
        }

        .volume-slider:hover {
            opacity: 1;
        }

        .volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: #9147ff;
            border-radius: 50%;
            cursor: pointer;
        }

        .volume-slider::-moz-range-thumb {
            width: 14px;
            height: 14px;
            background: #9147ff;
            border-radius: 50%;
            cursor: pointer;
        }
    </style>