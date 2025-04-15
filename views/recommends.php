<?php
require_once __DIR__ . "/../core/deezer_api.php";
require_once __DIR__ . "/../core/search_youtube.php";
$config = require __DIR__ . '/../config/config.php';

$API_KEY = $config['API_KEY'] ?? '';
if (empty($API_KEY)) die('Error: API_KEY no configurada');

$youtube = new YoutubeSearch($API_KEY);

$deezer = new DeezerAPI();
$recommendations = $deezer->getTracksByGenres(6); // 6 tracks por género
?>

<div class="recommendations-component">
    <style>
        .recommendations {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .genre-section {
            margin-bottom: 40px;
        }

        .genre-title {
            font-size: 24px;
            margin-bottom: 20px;
            color: #333;
            font-weight: bold;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
        }

        .tracks-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
            padding: 10px;
        }

        .track {
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }

        .track:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .track img {
            width: 100%;
            height: 180px;
            object-fit: cover;
        }

        .track-info {
            padding: 12px;
        }

        .track-title {
            font-weight: 600;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 5px;
        }

        .track-artist {
            color: #666;
            font-size: 13px;
        }

        .preview-player {
            width: 100%;
            margin-top: 10px;
        }

        @media (max-width: 768px) {
            .tracks-container {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
            }
        }
    </style>

    <div class="recommendations">
        <!-- Las recomendaciones se cargarán aquí via JavaScript -->
    </div>

    <script>
    // Convertimos los datos PHP a JSON accesible desde JavaScript
    const recommendationsData = <?php echo json_encode($recommendations); ?>;
    
    // Función para renderizar las secciones por género
    function renderGenreSections(data) {
        const container = document.querySelector('.recommendations');
        container.innerHTML = '';
        
        for (const [genre, tracks] of Object.entries(data)) {
            if (!tracks || !tracks.length) continue;
            
            const section = document.createElement('div');
            section.className = 'genre-section';
            section.innerHTML = `
                <h2 class="genre-title">${genre.charAt(0).toUpperCase() + genre.slice(1)}</h2>
                <div class="tracks-container" id="${genre}-tracks"></div>
            `;
            container.appendChild(section);
            renderTracks(tracks, document.getElementById(`${genre}-tracks`));
        }
    }

    // Función para renderizar los tracks
    function renderTracks(tracks, container) {
        tracks.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.className = 'track';
            trackElement.innerHTML = `
                <img src="${track.cover}" alt="${track.title}">
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                    <button class="play-button" 
                            data-artist="${encodeURIComponent(track.artist)}" 
                            data-title="${encodeURIComponent(track.title)}">
                        ▶ Reproducir
                    </button>
                </div>
            `;
            
            trackElement.querySelector('.play-button').addEventListener('click', function(e) {
                e.stopPropagation();
                playFullTrack(this);
            });
            
            container.appendChild(trackElement);
        });
    }

    // Función para reproducir la canción completa desde YouTube
    async function playFullTrack(button) {
        const artist = button.dataset.artist;
        const title = button.dataset.title;
        const originalText = button.textContent;
        
        button.textContent = 'Buscando...';
        button.disabled = true;
        
        try {
            // Primero intentamos buscar con "official" en el título
            let response = await fetch(`/public/youtube_search.php?query=${artist}+${title}+official&maxResults=3`);
            
            // Si no hay resultados, buscamos sin "official"
            if (!response.ok) {
                response = await fetch(`/public/search_youtube.php?query=${artist}+${title}&maxResults=3`);
            }
            
            const data = await response.json();
            
            if (!data || data.error || !data.length) {
                throw new Error('No se encontraron resultados');
            }
            
            // Seleccionamos el primer video (ya viene ordenado por relevancia)
            const videoId = data[0].videoId;
            playYouTubeVideo(videoId);
            
        } catch (error) {
            console.error('Error al buscar en YouTube:', error);
            alert('No se pudo encontrar la canción completa. Intenta nuevamente.');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    // Función para reproducir video de YouTube (igual que antes)
    function playYouTubeVideo(videoId) {
        // Cierra cualquier reproductor existente
        const existingPlayer = document.querySelector('.youtube-player');
        if (existingPlayer) existingPlayer.remove();
        
        const player = document.createElement('div');
        player.className = 'youtube-player';
        player.style.position = 'fixed';
        player.style.top = '0';
        player.style.left = '0';
        player.style.width = '100%';
        player.style.height = '100%';
        player.style.backgroundColor = 'rgba(0,0,0,0.9)';
        player.style.zIndex = '1000';
        player.style.display = 'flex';
        player.style.justifyContent = 'center';
        player.style.alignItems = 'center';
        player.innerHTML = `
            <div style="position: relative; width: 80%; max-width: 800px;">
                <button style="position: absolute; top: -40px; right: 0; background: #f44336; color: white; border: none; padding: 5px 10px; cursor: pointer;" 
                        onclick="this.parentNode.parentNode.remove()">
                    Cerrar
                </button>
                <iframe width="100%" height="450" src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                        frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen></iframe>
            </div>
        `;
        document.body.appendChild(player);
    }

    // Mostrar los datos al cargar
    document.addEventListener('DOMContentLoaded', () => {
        renderGenreSections(recommendationsData);
    });
    </script>
</div>