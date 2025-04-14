<?php

require_once __DIR__ . "/../models/Music.php";

class MusicController
{
    private $musicModel;

    public function __construct()
    {
        $this->musicModel = new Music();
    }

    public function getAllMusics()
    {
        return $this->musicModel->getMusic();
    }

    public function deleteMusic($videoId)
    {
        return $this->musicModel->deleteMusic($videoId);
    }
}
