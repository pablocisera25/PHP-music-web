// Variables globales para el reproductor
let youtubePlayer = null;
let playerReady = false;
let pendingVideoId = null;
let pendingTrackInfo = null;
let playerControls = null;

// 1. Cargar la API de YouTube dinámicamente
function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// 2. Función requerida por la API de YouTube
function onYouTubeIframeAPIReady() {
    youtubePlayer = new YT.Player('youtube-player', {
        height: '360',
        width: '640',
        playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            enablejsapi: 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 3. Cuando el reproductor está listo
function onPlayerReady(event) {
    console.log('Reproductor de YouTube listo');
    playerReady = true;
    
    // Inicializar controles del reproductor
    if (typeof PlayerControls !== 'undefined') {
        playerControls = new PlayerControls(event.target);
    }
    
    // Reproducir video pendiente si existe
    if (pendingVideoId) {
        playVideo(pendingVideoId, pendingTrackInfo);
        pendingVideoId = null;
        pendingTrackInfo = null;
    }
}

// 4. Manejar cambios de estado
function onPlayerStateChange(event) {
    console.log('Estado del reproductor:', event.data);
    
    if (playerControls) {
        if (event.data === YT.PlayerState.PLAYING) {
            playerControls.isPlaying = true;
            playerControls.playPauseBtn.textContent = '⏸️';
        } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            playerControls.isPlaying = false;
            playerControls.playPauseBtn.textContent = '▶️';
        }
    }
}

// 5. Función para reproducir video
function playVideo(videoId, trackInfo) {
    if (!playerReady) {
        console.log('Reproductor no listo, encolando video...');
        pendingVideoId = videoId;
        pendingTrackInfo = trackInfo;
        return;
    }

    try {
        console.log('Intentando reproducir video:', videoId);
        youtubePlayer.loadVideoById(videoId);
        youtubePlayer.playVideo();
        
        // Mostrar controles con la información de la canción
        if (playerControls) {
            playerControls.show(trackInfo);
            playerControls.isPlaying = true;
            playerControls.playPauseBtn.textContent = '⏸️';
        }
    } catch (error) {
        console.error('Error al reproducir:', error);
    }
}

// 6. Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Asignar la función global para la API
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    
    // Cargar la API si no está disponible
    if (typeof YT === 'undefined') {
        loadYouTubeAPI();
    } else if (typeof YT.Player !== 'undefined') {
        // Si la API ya está cargada
        onYouTubeIframeAPIReady();
    }

    // Configurar listeners para los botones de reproducción
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('play-btn')) {
            const musicCard = e.target.closest('.music-card');
            if (!musicCard) {
                console.error('No se encontró la tarjeta de música');
                return;
            }
            
            const videoId = musicCard.dataset.videoId;
            if (!videoId) {
                console.error('No se encontró el ID del video');
                return;
            }

            const trackInfo = {
                title: musicCard.querySelector('.card-title').textContent,
                channel: musicCard.querySelector('.card-channel').textContent,
                thumbnail: musicCard.querySelector('.card-thumbnail img').src
            };
            
            playVideo(videoId, trackInfo);
        }
    });
});