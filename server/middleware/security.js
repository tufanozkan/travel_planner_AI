const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına limit
});

const securityMiddleware = (app) => {
  // Temel güvenlik başlıkları
  app.use(helmet());

  // Rate limiting
  app.use("/api/", limiter);

  // CORS yapılandırması
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Origin",
      process.env.ALLOWED_ORIGINS || "*"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });
};

module.exports = securityMiddleware;
