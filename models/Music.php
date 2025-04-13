<?php

require_once __DIR__.'/../config/Database.php';

class Music
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function saveMusic($data)
    {
        $stmt = $this->db->prepare("INSERT INTO saved_music (video_id, userId,title, channel, thumbnail, url) 
                                     VALUES (:video_id, :userId, :title, :channel, :thumbnail, :url)");

        return $stmt->execute([
            ':video_id' => $data['videoId'],
            ':userId'=>$data['userId'],
            ':title' => $data['title'],
            ':channel' => $data['channel'],
            ':thumbnail' => $data['thumbnail'],
            ':url' => $data['url']
        ]);
    }

    public function getMusic()
    {
        $stmt = $this->db->prepare("
            SELECT * FROM saved_music
        ");

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}