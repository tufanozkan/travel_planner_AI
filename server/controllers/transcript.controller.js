const mongoose = require("mongoose");
const { getTranscriptModel } = require("../models/Transcript");
const { scrapeTranscript } = require("./scraping.controller");

// Transcript'i kaydet
const saveTranscript = async (req, res) => {
  try {
    const { videoId } = req.params;

    // Transcript'i çek
    const scrapeResponse = await new Promise((resolve) => {
      scrapeTranscript(
        {
          method: "GET",
          params: { videoId },
        },
        {
          status: (code) => ({
            json: (data) => resolve({ statusCode: code, data }),
          }),
        }
      );
    });

    if (scrapeResponse.statusCode !== 200) {
      return res.status(scrapeResponse.statusCode).json(scrapeResponse.data);
    }

    const { title, location, transcript } = scrapeResponse.data.data;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Konum bilgisi bulunamadı",
        data: scrapeResponse.data,
      });
    }

    // Lokasyona göre model al
    const TranscriptModel = getTranscriptModel(location);

    // Önce veritabanında kontrol et
    let existingTranscript = await TranscriptModel.findOne({ videoId });
    if (existingTranscript) {
      return res.status(200).json({
        success: true,
        message: "Transcript zaten mevcut",
        data: existingTranscript,
      });
    }

    // Yeni transcript oluştur ve kaydet
    const newTranscript = new TranscriptModel({
      videoId,
      title,
      location,
      transcript,
    });

    await newTranscript.save();

    return res.status(201).json({
      success: true,
      message: "Transcript başarıyla kaydedildi",
      data: newTranscript,
    });
  } catch (error) {
    console.error("Transcript kaydedilirken hata:", error);
    return res.status(500).json({
      success: false,
      message: "Transcript kaydedilirken hata oluştu",
      error: error.message,
    });
  }
};

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
  saveTranscript,
  getTranscriptsByLocation,
};
