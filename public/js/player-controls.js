// public/js/player-controls.js
class PlayerControls {
    constructor(youtubePlayer) {
        this.player = youtubePlayer;
        this.controls = document.getElementById('player-controls');
        this.isPlaying = false;
        this.updateInterval = null;

        // Elementos del DOM
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.rewindBtn = document.getElementById('rewind-btn');
        this.forwardBtn = document.getElementById('forward-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.progressBar = document.getElementById('progress-bar');
        this.progress = document.getElementById('progress');
        this.currentTimeDisplay = document.getElementById('current-time');
        this.durationDisplay = document.getElementById('duration');
        this.currentTitle = document.getElementById('current-title');
        this.currentChannel = document.getElementById('current-channel');
        this.currentThumbnail = document.getElementById('current-thumbnail');

        // sonido

        this.muteBtn = document.getElementById('mute-btn');
        this.volumeSlider = document.getElementById('volume-slider');
        this.isMuted = false;

        // Event listeners
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.rewindBtn.addEventListener('click', () => this.rewind());
        this.forwardBtn.addEventListener('click', () => this.forward());
        this.restartBtn.addEventListener('click', () => this.restart());
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));

        // Actualizar controles periódicamente
        this.updateInterval = setInterval(() => this.updateProgress(), 1000);
    }

    toggleMute() {
        if (this.isMuted) {
            this.player.unMute();
            this.muteBtn.textContent = '🔊';
            this.volumeSlider.value = this.player.getVolume();
        } else {
            this.player.mute();
            this.muteBtn.textContent = '🔇';
        }
        this.isMuted = !this.isMuted;
    }

    setVolume(volume) {
        this.player.setVolume(volume);
        if (volume == 0) {
            this.muteBtn.textContent = '🔇';
            this.isMuted = true;
        } else {
            this.muteBtn.textContent = '🔊';
            this.isMuted = false;
        }
    }

    show(trackInfo) {
        this.currentTitle.textContent = trackInfo.title;
        this.currentChannel.textContent = trackInfo.channel;
        this.currentThumbnail.src = trackInfo.thumbnail;
        this.controls.style.display = 'block';
        this.volumeSlider.value = this.player.getVolume();
        this.isMuted = this.player.isMuted();
        this.muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
    }

    hide() {
        this.controls.style.display = 'none';
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.player.pauseVideo();
            this.playPauseBtn.textContent = '▶️';
        } else {
            this.player.playVideo();
            this.playPauseBtn.textContent = '⏸️';
        }
        this.isPlaying = !this.isPlaying;
    }

    stop() {
        this.player.stopVideo();
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶️';
        this.hide();
    }

    rewind() {
        const currentTime = this.player.getCurrentTime();
        this.player.seekTo(Math.max(0, currentTime - 10), true);
    }

    forward() {
        const currentTime = this.player.getCurrentTime();
        this.player.seekTo(currentTime + 10, true);
    }

    restart() {
        this.player.seekTo(0, true);
        this.player.playVideo();
        this.isPlaying = true;
        this.playPauseBtn.textContent = '⏸️';
    }

    seek(event) {
        const percent = event.offsetX / this.progressBar.offsetWidth;
        this.player.seekTo(this.player.getDuration() * percent, true);
    }

    updateProgress() {
        if (!this.player || !this.player.getCurrentTime) return;

        const currentTime = this.player.getCurrentTime();
        const duration = this.player.getDuration();

        if (duration > 0) {
            const percent = (currentTime / duration) * 100;
            this.progress.style.width = `${percent}%`;

            this.currentTimeDisplay.textContent = this.formatTime(currentTime);
            this.durationDisplay.textContent = this.formatTime(duration);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

// Exportar para usar en search.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerControls;
}