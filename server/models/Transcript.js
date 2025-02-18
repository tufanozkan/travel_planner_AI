const mongoose = require("mongoose");

const transcriptSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
    index: true,
  },
  transcript: {
    type: String,
    required: true,
  },
  nlpAnalysis: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Dinamik model oluşturma fonksiyonu
const getTranscriptModel = (location) => {
  const collectionName = location.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Eğer bu lokasyon için model zaten varsa, onu döndür
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }

  // Yoksa yeni model oluştur
  return mongoose.model(collectionName, transcriptSchema);
};

module.exports = {
  transcriptSchema,
  getTranscriptModel,
};
