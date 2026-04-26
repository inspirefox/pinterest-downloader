const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.urlencoded({ extended: true }));

// 👉 Yaha apni API key daalo
const API_KEY = "b4346b269cmshef0a29e27076f9fp11fc67jsnad80e88c7996";

// 👉 API host (RapidAPI se milega)
const API_HOST = "pinterest-video-and-image-downloader.p.rapidapi.com";

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
    const response = await axios.get(
      "https://pinterest-video-and-image-downloader.p.rapidapi.com/",
      {
        params: { url },
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": API_HOST
        }
      }
    );

    const data = response.data;

    // 🔥 Video
    if (data.data && data.data.videos && data.data.videos.length > 0) {
      const videoUrl = data.data.videos[0].url;

      res.send(`
        <h2>Video Found 🎥</h2>
        <video src="${videoUrl}" controls width="400"></video>
        <br><br>
        <a href="${videoUrl}" download>Download Video</a>
      `);
    }

    // 🖼️ Image
    else if (data.data && data.data.images && data.data.images.length > 0) {
      const imgUrl = data.data.images[0].url;

      res.send(`
        <h2>Image Found 🖼️</h2>
        <img src="${imgUrl}" width="300"/>
        <br><br>
        <a href="${imgUrl}" download>Download Image</a>
      `);
    }

    else {
      res.send("❌ Media not found");
    }

  } catch (err) {
    res.send("⚠️ API Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started"));
