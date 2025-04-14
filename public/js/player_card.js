let player;
let currentVideoId = null;
let currentVideoTitle = '';
let currentVideoChannel = '';
let currentVideoThumbnail = '';
let currentVideoUrl = '';
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
    favoriteBtn.addEventListener('click', async function (event) {
        event.preventDefault();
        event.stopPropagation(); // ⚡ Esto evita que otros listeners activen sus mensajes
    
        if (!currentVideoId) {
            createToast('No hay ninguna canción reproduciéndose', 'error');
            return;
        }
    
        try {
            const originalText = favoriteBtn.textContent;
            favoriteBtn.textContent = '⌛';
            favoriteBtn.disabled = true;
    
            const response = await fetch('/controllers/save_music.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    videoId: currentVideoId,
                    title: currentVideoTitle,
                    channel: currentVideoChannel,
                    thumbnail: currentVideoThumbnail,
                    url: currentVideoUrl
                })
            });
    
            if (!response.ok) throw new Error('Error en la red');
    
            const result = await response.json();
    
            if (result.success) {
                favoriteBtn.textContent = '✓';
                setTimeout(() => {
                    favoriteBtn.textContent = originalText;
                    favoriteBtn.disabled = false;
                }, 1500);
                createToast(result.message || `Canción guardada: ${currentVideoTitle}`, 'success'); // 🔥 Solo tu toast
            } else {
                throw new Error(result.message || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error:', error);
            favoriteBtn.textContent = '📁';
            favoriteBtn.disabled = false;
            createToast(error.message, 'error'); // 🔥 Solo tu toast
        }
    });
}


// TOAST CUSTOM CASERO 🔥
function createToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.textContent = message;

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: type === 'success' ? '#4CAF50' :
                         type === 'error'   ? '#F44336' :
                         type === 'warning' ? '#FFC107' :
                         '#2196F3',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '15px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
        opacity: 0,
        transition: 'opacity 0.3s ease',
    });

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = 1;
    }, 100);

    setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
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
function playVideo(videoId, videoTitle, videoChannel, thumbnail, url, button) {

    // Guardar los datos globalmente
    currentVideoId = videoId;
    currentVideoTitle = videoTitle;
    currentVideoChannel = videoChannel;
    currentVideoThumbnail = thumbnail;
    currentVideoUrl = url;

    if (!isPlayerReady) {
        // Agregar a la cola de acciones pendientes
        pendingActions.push({ videoId, videoTitle, videoChannel, thumbnail, url, button });

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
            const videoThumbnail = card.querySelector('img').getAttribute('src');
            const videoUrl = card.querySelector('.youtube-link').getAttribute('href');

            if (videoId) {
                playVideo(videoId, videoTitle, videoChannel, videoThumbnail, videoUrl, this);
            }
        });
    });
});