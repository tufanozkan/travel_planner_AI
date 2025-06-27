const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");

// POST /api/search
router.post("/", async (req, res) => {
  try {
    const { location, budget, personCount, interests, holidayDays } = req.body;

    // Validate required fields
    if (!location || !budget || !personCount || !interests || !holidayDays) {
      return res.status(400).json({
        error:
          "Eksik parametreler. location, budget, personCount, interests ve holidayDays gereklidir.",
      });
    }

    // Create a base query
    const baseQuery = `I'm planning a trip to ${location}`;

    // Prepare travel parameters
    const travelParams = {
      location,
      budget,
      personCount,
      interests: Array.isArray(interests) ? interests : [interests],
      holidayDays,
    };

    // Get the absolute path to the Python script
    const scriptPath = path.join(
      __dirname,
      "../python_scripts/travel_rag_ollamaa.py"
    );
    const pythonPath = path.join(
      __dirname,
      "../python_scripts/venv/bin/python3"
    );

    // Log the paths and parameters
    console.log("Çalıştırılacak Python:", pythonPath);
    console.log("Script yolu:", scriptPath);
    console.log("Çalışma dizini:", path.dirname(scriptPath));

    // Spawn Python process
    const pythonProcess = spawn(
      pythonPath,
      [scriptPath, baseQuery, JSON.stringify(travelParams)],
      {
        cwd: path.dirname(scriptPath),
      }
    );

    let outputData = "";
    let errorData = "";

    // Collect data from stdout
    pythonProcess.stdout.on("data", (data) => {
      outputData += data.toString();
    });

    // Collect data from stderr
    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
      console.log("Python hatası:", data.toString());
    });

    // Handle process completion
    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.log("Python script hatası:", errorData);
        return res
          .status(500)
          .json({ error: "Python script çalıştırılırken hata oluştu." });
      }

      try {
        // Clean the output and find valid JSON
        const cleanOutput = outputData.trim();
        let result;

        // Try to find JSON in the output
        const matches = cleanOutput.match(/\{[\s\S]*\}/g);
        if (matches && matches.length > 0) {
          // Get the last complete JSON object
          const lastJson = matches[matches.length - 1];
          result = JSON.parse(lastJson);
        } else {
          throw new Error("Geçerli JSON bulunamadı");
        }

        res.json({ data: result });
      } catch (error) {
        console.log("JSON parse hatası:", error);
        res.status(500).json({
          error: "JSON parse hatası",
          details: error.message,
          rawOutput: outputData,
        });
      }
    });
  } catch (error) {
    console.error("Server hatası:", error);
    res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
});

module.exports = router;
