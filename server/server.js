require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

// Express app oluştur
const app = express();

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, "uploads");
fs.mkdir(uploadsDir, { recursive: true }).catch((err) =>
  console.error("Uploads klasörü oluşturulamadı:", err)
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const scrapingRoutes = require("./routes/scraping.routes");
app.use("/api/scrape", scrapingRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "İstenen kaynak bulunamadı",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Hata türüne göre özel mesajlar
  const statusCode = err.statusCode || 500;
  const message = err.message || "Sunucu hatası";

  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Port tanımla ve sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM sinyali alındı. Sunucu kapatılıyor...");
  process.exit(0);
});
