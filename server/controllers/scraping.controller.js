const cheerio = require("cheerio");
const fs = require("fs").promises;
const path = require("path");
const puppeteer = require("puppeteer");

const scrapeTranscript = async (req, res) => {
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
        // Puppeteer ile browser başlat
        const browser = await puppeteer.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        // Sayfaya git
        await page.goto(url);

        // Sayfanın yüklenmesi için bekle
        await new Promise((resolve) => setTimeout(resolve, 5000));

        try {
          // Transcript elementlerinin yüklenmesini bekle
          await page.waitForSelector(".group", {
            timeout: 10000,
            visible: true,
          });

          // Sayfanın HTML içeriğini al
          const content = await page.evaluate(
            () => document.documentElement.outerHTML
          );

          // Browser'ı kapat
          await browser.close();

          const $ = cheerio.load(content);
          const transcript = [];

          // Her bir grup elementini seç ve işle
          $(".group").each((i, el) => {
            const timeElement = $(el)
              .find(".text-xs.text-muted-foreground")
              .first();
            const textElement = $(el)
              .find(".text-sm.leading-relaxed.font-light")
              .first();

            const time = timeElement.text().trim();
            const text = textElement.text().trim();

            if (time && text) {
              // Gereksiz butonları ve boşlukları temizle
              const cleanText = text.replace(/add a note|jump to/g, "").trim();
              transcript.push({ time, text: cleanText });
            }
          });

          if (transcript.length === 0) {
            return res.status(404).json({
              success: false,
              message: "Transcript bulunamadı",
              error: "No transcript found",
              videoId,
              debug: {
                url,
                htmlPreview: content.slice(0, 500),
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
        } catch (selectorError) {
          // Selector bulunamadıysa sayfanın içeriğini debug için logla
          const pageContent = await page.content();
          console.log("Sayfa içeriği:", pageContent);
          throw new Error(`Selector bulunamadı: ${selectorError.message}`);
        }
      } catch (error) {
        console.error("Video transcript'i çekilirken hata:", error);
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
