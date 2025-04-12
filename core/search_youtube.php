<?php

class YoutubeSearch
{
    private $apiKey;

    public function __construct($apiKey)
    {
        $this->apiKey = $apiKey;
    }

    public function search($query, $maxResults=12)
    {
        $url = 'https://www.googleapis.com/youtube/v3/search';

        $params = [
            "part"=>"snippet",
            "q"=>$query,
            "maxResults"=>$maxResults,
            "type"=>"video",
            "videoCategoryId"=>'10', // solo musica
            "key"=>$this->apiKey,
            "order"=>"relevance"
        ];

        # utilizamos curl para la petición

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $httpCode=curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if($httpCode !== 200)
        {
            return ['error'=> 'Error into api: HTTP'. $httpCode];
        }

        $data = json_decode($response, true);
        return $this->formatResults($data);
    }

    private function formatResults($data) {
        $results = [];
        foreach ($data['items'] as $item) {
            $results[] = [
                'videoId' => $item['id']['videoId'],
                'title' => $item['snippet']['title'],
                'channel' => $item['snippet']['channelTitle'],
                'thumbnail' => $item['snippet']['thumbnails']['default']['url'],
                'url' => 'https://youtu.be/' . $item['id']['videoId']
            ];
        }
        return $results;
    }
}