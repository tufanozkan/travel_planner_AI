const mongoose = require("mongoose");
const { getTranscriptModel } = require("../models/Transcript");

// Konuma göre transcript'leri getir
const getTranscriptsByLocation = async (req, res) => {
  try {
    const { location } = req.params;

    // Lokasyona göre model al
    const TranscriptModel = getTranscriptModel(location);

    const transcripts = await TranscriptModel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: `${location} için transcript'ler başarıyla getirildi`,
      data: transcripts,
      count: transcripts.length,
    });
  } catch (error) {
    console.error("Transcript'ler getirilirken hata:", error);
    return res.status(500).json({
      success: false,
      message: "Transcript'ler getirilirken hata oluştu",
      error: error.message,
    });
  }
};

module.exports = {
  getTranscriptsByLocation,
};
