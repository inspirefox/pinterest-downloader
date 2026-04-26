const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.urlencoded({ extended: true }));

// Home Page
app.get("/", (req, res) => {
  res.send(`
    <h2>Pinterest Downloader 🔥</h2>
    <form method="POST" action="/download">
      <input type="text" name="url" placeholder="Paste Pinterest URL" style="width:300px;padding:10px;" required />
      <br><br>
      <button type="submit">Download</button>
    </form>
  `);
});

// Download Route
app.post("/download", async (req, res) => {
  const url = req.body.url;

  try {
    // 🔥 unofficial API (no key needed)
    const api = `https://pinterestdownloader.io/api/pinterest?url=${encodeURIComponent(url)}`;

    const response = await axios.get(api);
    const data = response.data;

    if (data && data.video) {
      res.send(`
        <h2>Video Found 🎥</h2>
        <video src="${data.video}" controls width="400"></video>
        <br><br>
        <a href="${data.video}" download>Download Video</a>
      `);
    } 
    else if (data && data.image) {
      res.send(`
        <h2>Image Found 🖼️</h2>
        <img src="${data.image}" width="300"/>
        <br><br>
        <a href="${data.image}" download>Download Image</a>
      `);
    } 
    else {
      res.send("❌ Media not found");
    }

  } catch (err) {
    res.send("⚠️ Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started"));
