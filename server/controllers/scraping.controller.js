const puppeteer = require("puppeteer");
const { countries } = require("countries-list");
const cities = require("cities.json");

// Türkiye'nin 81 ili
const turkishCities = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Amasya",
  "Ankara",
  "Antalya",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Isparta",
  "Mersin",
  "İstanbul",
  "İzmir",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Kahramanmaraş",
  "Mardin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Şanlıurfa",
  "Uşak",
  "Van",
  "Yozgat",
  "Zonguldak",
  "Aksaray",
  "Bayburt",
  "Karaman",
  "Kırıkkale",
  "Batman",
  "Şırnak",
  "Bartın",
  "Ardahan",
  "Iğdır",
  "Yalova",
  "Karabük",
  "Kilis",
  "Osmaniye",
  "Düzce",
];

const extractLocation = (title) => {
  if (!title) return null;

  // Başlığı temizle
  const cleanTitle = title
    .replace(/'/g, "") // Kesme işaretlerini kaldır
    .replace(/'/g, "") // Farklı kesme işaretlerini kaldır
    .replace(/'/g, "") // Farklı kesme işaretlerini kaldır
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Türkçe karakter varyasyonlarını oluştur
  const createVariations = (text) => {
    const charMap = {
      i: ["i", "ı", "İ", "I"],
      ı: ["i", "ı", "İ", "I"],
      İ: ["i", "ı", "İ", "I"],
      I: ["i", "ı", "İ", "I"],
      ğ: ["ğ", "g", "Ğ", "G"],
      Ğ: ["ğ", "g", "Ğ", "G"],
      ü: ["ü", "u", "Ü", "U"],
      Ü: ["ü", "u", "Ü", "U"],
      ş: ["ş", "s", "Ş", "S"],
      Ş: ["ş", "s", "Ş", "S"],
      ö: ["ö", "o", "Ö", "O"],
      Ö: ["ö", "o", "Ö", "O"],
      ç: ["ç", "c", "Ç", "C"],
      Ç: ["ç", "c", "Ç", "C"],
    };

    let variations = [text];

    // Her karakter için olası varyasyonları oluştur
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (charMap[char]) {
        const newVariations = [];
        variations.forEach((variant) => {
          charMap[char].forEach((replacement) => {
            newVariations.push(
              variant.slice(0, i) + replacement + variant.slice(i + 1)
            );
          });
        });
        variations = [...variations, ...newVariations];
      }
    }

    // Büyük/küçük harf varyasyonları
    variations = variations.reduce((acc, variant) => {
      acc.push(variant.toLowerCase());
      acc.push(variant.toUpperCase());
      acc.push(
        variant.charAt(0).toUpperCase() + variant.slice(1).toLowerCase()
      );
      return acc;
    }, []);

    // Tekrar eden varyasyonları kaldır
    return [...new Set(variations)];
  };

  // Ekleri kontrol et
  const checkSuffixes = (word, location) => {
    const suffixes = [
      "", // Eksiz hal
      "da",
      "de",
      "ta",
      "te", // Bulunma hali
      "dan",
      "den",
      "tan",
      "ten", // Ayrılma hali
      "a",
      "e", // Yönelme hali
      "nin",
      "nın",
      "nün",
      "nun", // İyelik hali
      "li",
      "lı",
      "lu",
      "lü", // -li hali
      "daki",
      "deki",
      "taki",
      "teki", // Bulunma + ki
    ];

    const variations = createVariations(location);

    return variations.some((variant) =>
      suffixes.some(
        (suffix) => word === variant + suffix || word.startsWith(variant + " ")
      )
    );
  };

  // Kelimelere ayır
  const words = cleanTitle.toLowerCase().split(" ");

  // Türkiye'nin illerini kontrol et
  for (const city of turkishCities) {
    if (words.some((word) => checkSuffixes(word, city))) {
      return city;
    }
  }

  return null;
};

const scrapeTranscript = async (req, res) => {
  let browser;
  try {
    if (req.method === "GET") {
      const { videoId } = req.params;
      if (!videoId) {
        return res.status(400).json({
          success: false,
          message: "Video ID gerekli",
        });
      }

      const url = `https://www.youtube-transcript.io/videos/${videoId}`;

      try {
        browser = await puppeteer.launch({
          headless: "new",
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu",
            "--window-size=1920x1080",
          ],
        });

        const page = await browser.newPage();

        // User agent ekle
        await page.setUserAgent(
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        // Sayfaya git ve tam yüklenmesini bekle
        await page.goto(url, {
          waitUntil: "networkidle0",
          timeout: 30000,
        });

        // Biraz bekle
        await new Promise((resolve) => setTimeout(resolve, 8000));

        // Sayfa başlığını h2 elementinden al
        const title = await page.evaluate(() => {
          const titleElement = document.querySelector("h2.text-lg");
          return titleElement ? titleElement.textContent.trim() : "";
        });

        // Sayfadaki tüm transcript elementlerini bul
        const transcript = await page.evaluate(() => {
          const groups = document.querySelectorAll(".group");
          return Array.from(groups)
            .map((group) => {
              const timeElement = group.querySelector(
                ".text-xs.text-muted-foreground"
              );
              const textElement = group.querySelector(
                ".text-sm.leading-relaxed.font-light"
              );

              return {
                time: timeElement ? timeElement.textContent.trim() : "",
                text: textElement
                  ? textElement.textContent
                      .replace("add a note", "")
                      .replace("jump to", "")
                      .trim()
                  : "",
              };
            })
            .filter((item) => item.time && item.text);
        });

        // Browser'ı kapat
        await browser.close();
        browser = null;

        // Konum bilgisini çıkar
        const location = extractLocation(title);

        if (transcript.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Transcript bulunamadı",
            data: {
              videoId,
              title,
              location,
            },
          });
        }

        return res.status(200).json({
          success: true,
          message: "Transcript başarıyla alındı",
          data: {
            videoId,
            title,
            location,
            transcript,
          },
          count: transcript.length,
        });
      } catch (error) {
        console.error("Video transcript'i çekilirken hata:", error);
        if (browser) await browser.close();
        return res.status(500).json({
          success: false,
          message: "Video transcript'i çekilirken hata oluştu",
          error: error.message,
          videoId,
        });
      }
    }
  } catch (error) {
    console.error("Hata:", error);
    if (browser) {
      await browser.close();
    }
    return res.status(500).json({
      success: false,
      message: "Bir hata oluştu",
      error: error.message,
    });
  }
};

module.exports = {
  scrapeTranscript,
};
