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
let pendingActions = [];
let playerInitialized = false;
let retryCount = 0;
let playerLoadTimeout = null;

const MAX_RETRIES = 3;
const PLAYER_LOAD_TIMEOUT = 10000;

// Función para formatear el tiempo
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Cargar el API de YouTube
function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
    }

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    tag.onerror = () => {
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(loadYouTubeAPI, 1000 * retryCount);
        } else {
            console.error('Error al cargar YouTube API');
            createToast('Error al cargar el reproductor. Recarga la página.', 'error');
        }
    };
    
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    setTimeout(() => {
        if (!playerInitialized && retryCount < MAX_RETRIES) {
            retryCount++;
            loadYouTubeAPI();
        }
    }, PLAYER_LOAD_TIMEOUT);
}

// Inicializar el reproductor
function initializePlayer() {
    try {
        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            host: 'https://www.youtube.com',
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'disablekb': 1,
                'modestbranding': 1,
                'enablejsapi': 1,
                'origin': window.location.origin
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
        
        playerLoadTimeout = setTimeout(() => {
            if (!isPlayerReady && retryCount < MAX_RETRIES) {
                retryCount++;
                initializePlayer();
            }
        }, PLAYER_LOAD_TIMEOUT);
    } catch (error) {
        console.error('Error al inicializar el reproductor:', error);
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(initializePlayer, 1000 * retryCount);
        }
    }
}

function onYouTubeIframeAPIReady() {
    initializePlayer();
}

function onPlayerReady(event) {
    clearTimeout(playerLoadTimeout);
    isPlayerReady = true;
    playerInitialized = true;
    retryCount = 0;
    
    try {
        // Verificar si el reproductor está realmente listo
        if (player && typeof player.setVolume === 'function') {
            player.setVolume(lastVolume);
        } else {
            console.warn('El reproductor no está completamente inicializado');
            return;
        }

        setupControls();
        processPendingActions();
        restorePlayButtons();
        console.log('Reproductor de YouTube listo');
    } catch (error) {
        console.error('Error en onPlayerReady:', error);
    }
}

// Resto del código permanece igual...

function onPlayerError(event) {
    console.error('Error en el reproductor:', event.data);
    
    let errorMessage = 'Error al reproducir el video';
    switch(event.data) {
        case 2: errorMessage = 'ID de video no válido'; break;
        case 5: errorMessage = 'Error en el reproductor HTML5'; break;
        case 100: errorMessage = 'Video no encontrado'; break;
        case 101: 
        case 150: errorMessage = 'El video no permite reproducción embebida'; break;
    }
    
    createToast(errorMessage, 'error');
    
    // Reintentar solo para errores recuperables
    if ([2, 5, 100].includes(event.data) && retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(() => {
            if (currentVideoId) {
                player.loadVideoById(currentVideoId);
            }
        }, 1000 * retryCount);
    } else {
        restorePlayButtons();
    }
}

function processPendingActions() {
    if (pendingActions.length === 0) return;
    
    console.log('Procesando acciones pendientes:', pendingActions.length);
    
    pendingActions.forEach(action => {
        const { videoId, videoTitle, videoChannel, thumbnail, url, button } = action;
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

    switch (event.data) {
        case YT.PlayerState.PLAYING:
            container.style.display = 'block';
            playPauseBtn.textContent = '❚❚';
            startProgressTimer();
            retryCount = 0; // Resetear contador de reintentos al reproducir
            break;
            
        case YT.PlayerState.PAUSED:
            playPauseBtn.textContent = '▶';
            stopProgressTimer();
            break;
            
        case YT.PlayerState.ENDED:
            playPauseBtn.textContent = '▶';
            stopProgressTimer();
            break;
            
        case YT.PlayerState.BUFFERING:
            handleBuffering();
            break;
            
        case YT.PlayerState.CUED:
            // Video cargado pero no reproduciendo
            break;
            
        case YT.PlayerState.UNSTARTED:
            // Video no iniciado
            break;
    }
}

function handleBuffering() {
    // Si lleva más de 5 segundos buffereando, intentar solucionarlo
    setTimeout(() => {
        if (player && player.getPlayerState() === YT.PlayerState.BUFFERING) {
            const currentTime = player.getCurrentTime();
            const newTime = currentTime < 1 ? currentTime + 1 : currentTime + 5;
            player.seekTo(newTime, true);
            createToast('Optimizando reproducción...', 'info');
        }
    }, 5000);
}

function setupControls() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');

    // Play/Pause
    playPauseBtn.addEventListener('click', function () {
        if (!isPlayerReady) return;
        
        try {
            if (player.getPlayerState() === YT.PlayerState.PLAYING) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        } catch (error) {
            console.error('Error al controlar reproducción:', error);
            createToast('Error al controlar la reproducción', 'error');
        }
    });

    // Barra de progreso
    progressContainer.addEventListener('click', function (e) {
        if (!currentVideoId || !isPlayerReady) return;

        try {
            const rect = this.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            player.seekTo(player.getDuration() * percent, true);
        } catch (error) {
            console.error('Error al buscar posición:', error);
        }
    });

    // Mute/Unmute
    muteBtn.addEventListener('click', function () {
        if (!isPlayerReady) return;
        
        try {
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
        } catch (error) {
            console.error('Error al controlar volumen:', error);
        }
    });

    // Control de volumen
    volumeSlider.addEventListener('input', function () {
        if (!isPlayerReady) return;
        
        try {
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
        } catch (error) {
            console.error('Error al ajustar volumen:', error);
        }
    });

    // Botón de favoritos
    const favoriteBtn = document.getElementById('favorite-btn');
    favoriteBtn.addEventListener('click', async function (event) {
        event.preventDefault();
        event.stopPropagation();
    
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
                createToast(result.message || `Canción guardada: ${currentVideoTitle}`, 'success');
            } else {
                throw new Error(result.message || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error:', error);
            favoriteBtn.textContent = '📁';
            favoriteBtn.disabled = false;
            createToast(error.message, 'error');
        }
    });
}

// TOAST CUSTOM CASERO
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
                         type === 'info'   ? '#2196F3' :
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

    try {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        
        // Verificar valores válidos
        if (isNaN(currentTime) || isNaN(duration)) return;
        
        const percent = (currentTime / duration) * 100;

        document.getElementById('progress-bar').style.width = percent + '%';
        document.getElementById('time-display').textContent =
            `${formatTime(currentTime)} / ${formatTime(duration)}`;
    } catch (error) {
        console.error('Error al actualizar progreso:', error);
    }
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

    if (!player || !player.loadVideoById) {
        createToast('Reproductor no disponible. Inténtalo de nuevo.', 'error');
        return;
    }

    currentVideoId = videoId;
    currentVideoTitle = videoTitle;
    currentVideoChannel = videoChannel;

    nowPlaying.textContent = videoTitle;
    playerChannel.textContent = videoChannel;
    container.style.display = 'block';

    try {
        // Si ya está reproduciendo el mismo video, pausarlo
        if (player.getPlayerState() === YT.PlayerState.PLAYING && 
            player.getVideoData().video_id === videoId) {
            player.pauseVideo();
            return;
        }

        // Cargar y reproducir el nuevo video con calidad baja para mejor rendimiento
        player.loadVideoById({
            videoId: videoId,
            suggestedQuality: 'small'
        });
        
        // Forzar reproducción después de un breve retraso por si falla el autoplay
        setTimeout(() => {
            if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
                player.playVideo();
            }
        }, 500);
    } catch (error) {
        console.error('Error al reproducir:', error);
        createToast('Error al reproducir el video', 'error');
    }
}

// Función para manejar la reproducción (con cola de eventos)
function playVideo(videoId, videoTitle, videoChannel, thumbnail, url, button) {
    // Guardar los datos globalmente
    currentVideoId = videoId;
    currentVideoTitle = videoTitle;
    currentVideoChannel = videoChannel;
    currentVideoThumbnail = thumbnail;
    currentVideoUrl = url;

    // Actualizar UI inmediatamente
    document.getElementById('now-playing').textContent = videoTitle;
    document.getElementById('player-channel').textContent = videoChannel;
    document.getElementById('player-container').style.display = 'block';

    if (button) {
        button.textContent = "Cargando...";
        button.disabled = true;
    }

    if (!isPlayerReady) {
        pendingActions.push({ videoId, videoTitle, videoChannel, thumbnail, url, button });
        
        // Asegurarnos de que el reproductor se está cargando
        if (!playerInitialized) {
            loadYouTubeAPI();
        }
        return;
    }

    executePlayAction(videoId, videoTitle, videoChannel);
}

// Asignar eventos a los botones de reproducción
document.addEventListener('DOMContentLoaded', function () {
    // Cargar el API de YouTube al iniciar la página
    loadYouTubeAPI();

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