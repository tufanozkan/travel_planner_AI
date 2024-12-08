require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());

// Middleware
app.use(express.json());

// Test Endpoint
app.get("/", (req, res) => {
  res.send("Travel Planner Backend is running!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
