const express = require("express");
const router = express.Router();
const {
  saveTranscript,
  getTranscriptsByLocation,
} = require("../controllers/transcript.controller");

// Transcript'i kaydet
router.post("/save/:videoId", saveTranscript);

// Konuma göre transcript'leri getir
router.get("/location/:location", getTranscriptsByLocation);

module.exports = router;
