<?php
class DeezerAPI {
    private const API_BASE_URL = "https://api.deezer.com/";
    private const GENRES = [
        'rock' => 152,
        'pop' => 132,
        'reggae' => 144,
        'reggaeton' => 165
    ];

    public function getTracksByGenres($limitPerGenre = 6) {
        $results = [];
        foreach (self::GENRES as $genreName => $genreId) {
            $tracks = $this->getGenreTracks($genreId, $limitPerGenre);
            if (!empty($tracks)) {
                $results[$genreName] = $tracks;
            }
        }
        $randomGenreId = array_values(self::GENRES)[rand(0, count(self::GENRES)-1)];
        $results['random'] = $this->getGenreTracks($randomGenreId, $limitPerGenre);
        return $results;
    }

    public function getRandomTracks($limit = 10) {
        $genre = $this->getRandomGenre();
        return $genre ? $this->getGenreTracks($genre['id'], $limit) : ['error' => 'No se pudo obtener género aleatorio'];
    }

    private function getRandomGenre() {
        $url = self::API_BASE_URL . 'genre';
        $response = $this->makeRequest($url);
        if (empty($response['data'])) {
            return ["id" => 132, "name" => 'pop', "picture" => "https://e-cdns-images.dzcdn.net/images/misc/8d213cae9a0585b3e0b9c7d7c03c7b7a/56x56-000000-80-0-0.jpg"];
        }
        $validGenres = array_filter($response['data'], fn($genre) => $genre['id'] != 0);
        return $validGenres[array_rand($validGenres)];
    }

    private function getGenreTracks($genreId, $limit) {
        $url = self::API_BASE_URL . "chart/{$genreId}/tracks?limit={$limit}";
        $response = $this->makeRequest($url);
        if (empty($response['data'])) {
            $url = self::API_BASE_URL . "search?q=genre:'{$genreId}'&limit={$limit}";
            $response = $this->makeRequest($url);
        }
        return $this->formatTracks($response['data'] ?? []);
    }

    private function makeRequest($url) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
            CURLOPT_ENCODING => 'UTF-8'
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
        return json_decode($response, true);
    }

    private function formatTracks($tracks) {
        $formatted = [];
        foreach ($tracks as $track) {
            if (isset($track['title'])) {
                $formatted[] = [
                    'id' => $track['id'],
                    'title' => $track['title'],
                    'artist' => $track['artist']['name'] ?? 'Artista desconocido',
                    'cover' => $track['album']['cover_medium'] ?? $track['album']['cover'],
                    'preview' => $track['preview'] ?? null,
                    'duration' => $track['duration'] ?? 0,
                    'link' => $track['link'] ?? null,
                    'search_query' => urlencode(($track['artist']['name'] ?? '') . ' ' . $track['title'])
                ];
            }
        }
        return $formatted;
    }
}