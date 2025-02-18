const express = require("express");
const router = express.Router();
const {
  getTranscriptsByLocation,
} = require("../controllers/transcript.controller");

// Konuma göre transcript'leri getir
router.get("/location/:location", getTranscriptsByLocation);

module.exports = router;
