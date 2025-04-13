let player;
let currentVideoId = null;
let currentVideoTitle = '';
let currentVideoChannel = '';
let updateInterval;
let isDraggingProgress = false;
let isMuted = false;
let lastVolume = 50;
let isPlayerReady = false;
let pendingActions = []; // Cola de acciones pendientes

// Función para formatear el tiempo (segundos a MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Inicializar el reproductor de YouTube
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'disablekb': 1,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    isPlayerReady = true;
    // Configurar volumen inicial
    player.setVolume(50);

    // Configurar eventos de los controles
    setupControls();

    // Procesar acciones pendientes
    processPendingActions();

    // Restaurar estado de los botones
    restorePlayButtons();
}

function processPendingActions() {
    pendingActions.forEach(action => {
        const { videoId, videoTitle, videoChannel, button } = action;
        executePlayAction(videoId, videoTitle, videoChannel);

        // Restaurar el botón específico
        if (button) {
            button.textContent = "Reproducir";
            button.disabled = false;
        }
    });
    pendingActions = []; // Limpiar la cola
}

function restorePlayButtons() {
    document.querySelectorAll('.play-btn').forEach(button => {
        button.textContent = "Reproducir";
        button.disabled = false;
    });
}

function onPlayerStateChange(event) {
    const container = document.getElementById('player-container');
    const playPauseBtn = document.getElementById('play-pause-btn');

    if (event.data === YT.PlayerState.PLAYING) {
        container.style.display = 'block';
        playPauseBtn.textContent = '❚❚';
        startProgressTimer();
    } else if (event.data === YT.PlayerState.PAUSED) {
        playPauseBtn.textContent = '▶';
        stopProgressTimer();
    } else if (event.data === YT.PlayerState.ENDED) {
        playPauseBtn.textContent = '▶';
        stopProgressTimer();
    }
}

// Configurar los controles del reproductor
function setupControls() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');

    // Play/Pause
    playPauseBtn.addEventListener('click', function () {
        if (!isPlayerReady) return;
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });

    // Barra de progreso
    progressContainer.addEventListener('click', function (e) {
        if (!currentVideoId || !isPlayerReady) return;

        const rect = this.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        player.seekTo(player.getDuration() * percent, true);
    });

    // Mute/Unmute
    muteBtn.addEventListener('click', function () {
        if (!isPlayerReady) return;
        if (isMuted) {
            player.unMute();
            player.setVolume(lastVolume);
            volumeSlider.value = lastVolume;
            muteBtn.textContent = '🔊';
        } else {
            lastVolume = player.getVolume();
            player.mute();
            muteBtn.textContent = '🔇';
        }
        isMuted = !isMuted;
    });

    // Control de volumen
    volumeSlider.addEventListener('input', function () {
        if (!isPlayerReady) return;
        const volume = this.value;
        player.setVolume(volume);
        lastVolume = volume;

        if (volume == 0) {
            muteBtn.textContent = '🔇';
            isMuted = true;
        } else {
            muteBtn.textContent = '🔊';
            isMuted = false;
        }
    });

    // Dentro de la función setupControls(), agregar:
    const favoriteBtn = document.getElementById('favorite-btn');
    favoriteBtn.addEventListener('click', function () {
        if (currentVideoId) {
            alert(`Canción añadida a favoritos: ${currentVideoTitle}`);
            // Aquí luego implementarás la lógica real de favoritos
        } else {
            alert('No hay ninguna canción reproduciéndose');
        }
    });
}

// Actualizar la barra de progreso
function updateProgress() {
    if (!currentVideoId || isDraggingProgress || !isPlayerReady) return;

    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const percent = (currentTime / duration) * 100;

    document.getElementById('progress-bar').style.width = percent + '%';
    document.getElementById('time-display').textContent =
        `${formatTime(currentTime)} / ${formatTime(duration)}`;
}

function startProgressTimer() {
    stopProgressTimer();
    updateInterval = setInterval(updateProgress, 1000);
}

function stopProgressTimer() {
    clearInterval(updateInterval);
}

// Función para ejecutar la acción de reproducción
function executePlayAction(videoId, videoTitle, videoChannel) {
    const container = document.getElementById('player-container');
    const nowPlaying = document.getElementById('now-playing');
    const playerChannel = document.getElementById('player-channel');

    currentVideoId = videoId;
    currentVideoTitle = videoTitle;
    currentVideoChannel = videoChannel;

    nowPlaying.textContent = videoTitle;
    playerChannel.textContent = videoChannel;

    if (player.getPlayerState() === YT.PlayerState.PLAYING && player.getVideoData().video_id === videoId) {
        player.pauseVideo();
        return;
    }

    container.style.display = 'block';
    player.loadVideoById(videoId);
    player.playVideo();
}

// Función para manejar la reproducción (con cola de eventos)
function playVideo(videoId, videoTitle, videoChannel, button) {
    if (!isPlayerReady) {
        // Agregar a la cola de acciones pendientes
        pendingActions.push({ videoId, videoTitle, videoChannel, button });

        // Cambiar el estado del botón
        if (button) {
            button.textContent = "Cargando...";
            button.disabled = true;
        }
        return;
    }

    executePlayAction(videoId, videoTitle, videoChannel);
}

// Asignar eventos a los botones de reproducción
document.addEventListener('DOMContentLoaded', function () {
    const playButtons = document.querySelectorAll('.play-btn');

    playButtons.forEach(button => {
        button.addEventListener('click', function () {
            const card = this.closest('.music-card');
            const videoId = card.getAttribute('data-video-id');
            const videoTitle = card.querySelector('.card-title').textContent;
            const videoChannel = card.querySelector('.card-channel').textContent;

            if (videoId) {
                playVideo(videoId, videoTitle, videoChannel, this);
            }
        });
    });
});