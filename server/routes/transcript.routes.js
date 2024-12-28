const express = require("express");
const router = express.Router();
const {
  saveTranscript,
  getTranscriptsByLocation,
  getTranscriptByVideoId,
} = require("../controllers/transcript.controller");

// Transcript'i kaydet
router.post("/save/:videoId", saveTranscript);

// Konuma göre transcript'leri getir
router.get("/location/:location", getTranscriptsByLocation);

// Video ID'ye göre transcript getir
router.get("/video/:videoId", getTranscriptByVideoId);

module.exports = router;
