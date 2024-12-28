const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "turkey",
    });
    console.log(`MongoDB Atlas Bağlantısı Başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Bağlantı Hatası: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
