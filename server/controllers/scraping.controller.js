const cheerio = require("cheerio");
const fs = require("fs").promises;
const path = require("path");
const puppeteer = require("puppeteer");

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
        // Puppeteer ile browser başlat - daha fazla seçenek ekledik
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

        if (transcript.length === 0) {
          // Debug için sayfanın içeriğini kontrol et
          return res.status(404).json({
            success: false,
            message: "Transcript bulunamadı",
            error: "No transcript found",
            videoId,
            debug: {
              url,
              selectors: [
                ".group",
                ".text-xs.text-muted-foreground",
                ".text-sm.leading-relaxed.font-light",
              ],
            },
          });
        }

        // Transcript'i txt formatında oluştur
        let txtContent = "";
        transcript.forEach(({ time, text }) => {
          txtContent += `[${time}] ${text}\n`;
        });

        // Dosyayı kaydet
        const fileName = `transcript_${videoId}_${Date.now()}.txt`;
        const filePath = path.join(__dirname, "..", "uploads", fileName);

        await fs.writeFile(filePath, txtContent, "utf8");

        return res.status(200).json({
          success: true,
          message: "Transcript başarıyla kaydedildi",
          data: {
            videoId,
            transcript,
            fileName,
            filePath,
            txtContent,
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

    // POST isteği için body kontrolü
    const htmlContent = req.body?.div || req.body?.content || req.body?.html;

    if (!htmlContent) {
      return res.status(400).json({
        success: false,
        message: "Transcript içeriği gerekli",
        error: "Content is required",
        receivedBody: JSON.stringify(req.body),
      });
    }

    const $ = cheerio.load(htmlContent);
    const transcript = [];

    // Her bir grup elementini seç ve işle
    $(".group").each((i, el) => {
      const time = $(el).find(".text-xs.text-muted-foreground").text().trim();
      const text = $(el)
        .find(".text-sm.leading-relaxed.font-light")
        .text()
        .trim();

      if (time && text) {
        transcript.push({ time, text });
      }
    });

    // Eğer hiç transcript bulunamadıysa
    if (transcript.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transcript bulunamadı",
        error: "No transcript found",
        htmlReceived: htmlContent.slice(0, 100),
      });
    }

    // Transcript'i txt formatında oluştur
    let txtContent = "";
    transcript.forEach(({ time, text }) => {
      txtContent += `[${time}] ${text}\n`;
    });

    // Dosyayı kaydet
    const fileName = `transcript_${Date.now()}.txt`;
    const filePath = `./uploads/${fileName}`;

    try {
      await fs.writeFile(filePath, txtContent, "utf8");

      return res.status(200).json({
        success: true,
        message: "Transcript başarıyla kaydedildi",
        data: {
          transcript,
          fileName,
          filePath,
          txtContent,
        },
        count: transcript.length,
      });
    } catch (error) {
      console.error("Dosya kaydedilirken hata:", error);
      return res.status(500).json({
        success: false,
        message: "Transcript dosyası kaydedilemedi",
        error: error.message,
      });
    }
  } catch (error) {
    if (browser) await browser.close();
    console.error("İşlem sırasında hata:", error);
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
