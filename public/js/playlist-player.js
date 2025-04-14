let player;
let currentVideoId = null;
let currentPlayingItem = null;
let updateInterval;
let isPlayerReady = false;

// Formatear tiempo (segundos a MM:SS)
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
            'autoplay': 0,
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
    player.setVolume(50); // Volumen inicial al 50%
}

function onPlayerStateChange(event) {
    if (!currentPlayingItem) return;
    
    const playBtn = currentPlayingItem.querySelector('.mini-play-btn');
    
    if (event.data === YT.PlayerState.PLAYING) {
        playBtn.textContent = '❚❚';
        startProgressTimer();
    } else if (event.data === YT.PlayerState.PAUSED) {
        playBtn.textContent = '▶';
        stopProgressTimer();
    } else if (event.data === YT.PlayerState.ENDED) {
        playBtn.textContent = '▶';
        stopProgressTimer();
        resetProgressBar();
    }
}

// Actualizar la barra de progreso
function updateProgress() {
    if (!currentPlayingItem || !currentVideoId) return;

    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const percent = (currentTime / duration) * 100;

    const progressBar = currentPlayingItem.querySelector('.mini-progress-bar');
    const timeDisplay = currentPlayingItem.querySelector('.mini-time-display');

    progressBar.style.width = percent + '%';
    timeDisplay.textContent = formatTime(currentTime);
}

function startProgressTimer() {
    stopProgressTimer();
    updateInterval = setInterval(updateProgress, 1000);
}

function stopProgressTimer() {
    clearInterval(updateInterval);
}

function resetProgressBar() {
    if (!currentPlayingItem) return;
    
    const progressBar = currentPlayingItem.querySelector('.mini-progress-bar');
    const timeDisplay = currentPlayingItem.querySelector('.mini-time-display');
    
    progressBar.style.width = '0%';
    timeDisplay.textContent = '0:00';
}

// Manejar la reproducción de un video
function playVideo(videoId, item) {
    // Si ya está reproduciendo este video, pausarlo
    if (currentVideoId === videoId && player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
        return;
    }
    
    // Resetear el botón del item anterior si existe
    if (currentPlayingItem && currentPlayingItem !== item) {
        const prevPlayBtn = currentPlayingItem.querySelector('.mini-play-btn');
        prevPlayBtn.textContent = '▶';
    }
    
    // Actualizar el item actual
    currentPlayingItem = item;
    currentVideoId = videoId;
    
    // Si el reproductor está listo, cargar el video
    if (isPlayerReady) {
        player.loadVideoById(videoId);
        player.playVideo();
    }
}

// Configurar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos de los botones de reproducción
    document.querySelectorAll('.mini-play-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.music-item');
            const videoId = item.getAttribute('data-video-id');
            
            if (videoId) {
                playVideo(videoId, item);
            }
        });
    });
    
    // Configurar barras de progreso
    document.querySelectorAll('.mini-progress-container').forEach(container => {
        container.addEventListener('click', function(e) {
            if (!currentVideoId || !isPlayerReady) return;
            
            const item = this.closest('.music-item');
            if (item !== currentPlayingItem) return;
            
            const rect = this.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            player.seekTo(player.getDuration() * percent, true);
        });
    });
    
    // Configurar controles de volumen
    document.querySelectorAll('.mini-volume-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            if (!isPlayerReady) return;
            
            const item = this.closest('.music-item');
            if (item !== currentPlayingItem) return;
            
            const volume = this.value;
            player.setVolume(volume);
        });
    });
});