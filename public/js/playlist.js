let player;
let currentVideoId = null;
let seekBarInterval;

function extractVideoID(url) {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

// YouTube API calls this function automatically when ready
function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        height: '0',
        width: '0',
        videoId: '',
        playerVars: { autoplay: 1 },
        events: {
            'onReady': initializePlaylist,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Runs once the YouTube player is ready
function initializePlaylist() {
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const seekBar = document.getElementById('seek-bar');

    // Manejo de los botones de reproducción
    document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.playlist-item');
            const url = item.dataset.url;
            const videoId = extractVideoID(url);

            if (videoId && videoId !== currentVideoId) {
                player.loadVideoById(videoId);
                currentVideoId = videoId;
                document.getElementById('player-container').style.display = 'block';
            }

            document.querySelectorAll('.start-btn').forEach(b => b.style.display = 'inline-block');
            btn.style.display = 'none';
        });
    });

    pauseBtn.addEventListener('click', () => {
        player.pauseVideo();
    });

    stopBtn.addEventListener('click', () => {
        player.stopVideo();
        clearInterval(seekBarInterval);
        seekBar.value = 0;
        disableControls();
    });

    volumeSlider.addEventListener('input', e => {
        player.setVolume(e.target.value);
    });

    seekBar.addEventListener('input', e => {
        const duration = player.getDuration();
        const newTime = (e.target.value / 100) * duration;
        player.seekTo(newTime, true);
    });
}

function onPlayerStateChange(event) {
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const seekBar = document.getElementById('seek-bar');

    if (event.data === YT.PlayerState.PLAYING) {
        enableControls();

        clearInterval(seekBarInterval);
        seekBarInterval = setInterval(() => {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            if (!isNaN(duration) && duration > 0) {
                seekBar.value = (currentTime / duration) * 100;
            }
        }, 500);
    }

    if (event.data === YT.PlayerState.ENDED || event.data === YT.PlayerState.UNSTARTED || event.data === YT.PlayerState.PAUSED) {
        clearInterval(seekBarInterval);
    }
}

function enableControls() {
    document.getElementById('pause-btn').disabled = false;
    document.getElementById('stop-btn').disabled = false;
    document.getElementById('volume-slider').disabled = false;
    document.getElementById('seek-bar').disabled = false;
}

function disableControls() {
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('stop-btn').disabled = true;
    document.getElementById('volume-slider').disabled = true;
    document.getElementById('seek-bar').disabled = true;
}
