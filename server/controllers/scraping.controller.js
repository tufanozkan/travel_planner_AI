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

  // Başlığı küçük harfe çevir ve temizle
  const cleanTitle = title
    .toLowerCase()
    .replace(/'/g, "") // Kesme işaretlerini kaldır
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Türkçe karakterleri normalize et
  const normalizeText = (text) => {
    return text
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/İ/g, "i");
  };

  // Kelimelere ayır
  const words = cleanTitle.split(" ");

  // Önce Türkiye'nin illerini kontrol et
  for (const city of turkishCities) {
    const cityNormalized = normalizeText(city.toLowerCase());

    const cityFound = words.some((word) => {
      const normalizedWord = normalizeText(word);
      return (
        normalizedWord === cityNormalized ||
        normalizedWord === cityNormalized + "da" ||
        normalizedWord === cityNormalized + "ta" ||
        normalizedWord === cityNormalized + "de" ||
        normalizedWord === cityNormalized + "te" ||
        normalizedWord.startsWith(cityNormalized + " ")
      );
    });

    if (cityFound) {
      return city;
    }
  }

  // Türkiye şehirlerinde bulunamazsa diğer ülkeleri kontrol et
  for (const countryCode in countries) {
    const country = countries[countryCode];
    const countryNormalized = normalizeText(country.name.toLowerCase());

    if (words.some((word) => normalizeText(word) === countryNormalized)) {
      return country.name;
    }
  }

  // Son olarak global şehir veritabanını kontrol et
  const cityMatch = cities.find((city) => {
    const cityNormalized = normalizeText(city.name.toLowerCase());
    return words.some((word) => normalizeText(word) === cityNormalized);
  });

  if (cityMatch) {
    return cityMatch.name;
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
