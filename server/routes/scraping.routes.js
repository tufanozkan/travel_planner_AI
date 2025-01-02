const express = require("express");
const router = express.Router();
const { scrapeTranscript } = require("../controllers/scraping.controller");

//Video ID'ye göre transcript getir ve kaydet
router.get("/transcript/:videoId", scrapeTranscript);

module.exports = router;
