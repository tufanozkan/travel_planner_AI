const express = require("express");
const router = express.Router();

// POST /api/search
router.post("/", (req, res) => {
  const { search, budget, personCount, interests, holidayDays } = req.body;
  // Burada gelen verileri işleyebilir veya başka bir servise iletebilirsin
  // Örnek olarak sadece gelen veriyi döndürüyoruz:
  console.log("Arama verisi:", req.body);
  res.json({
    message: "Arama verisi başarıyla alındı.",
    data: { search, budget, personCount, interests, holidayDays },
  });
});

module.exports = router;
