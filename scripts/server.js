const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());

app.get("/:name", (req, res) => {
  const fileName = `../public/${req.params.name}`;
  console.log(fileName);
  // Check if the file exists
  if (!fs.existsSync(fileName)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Read the file
  fs.readFile(fileName, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Try parsing the file content as JSON
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (jsonError) {
      return res.status(400).json({ error: "File is not a valid JSON" });
    }

    // If parsing is successful, respond with the JSON data
    res.json(jsonData);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
