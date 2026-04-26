const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

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
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    // थोड़ा wait ताकि content load हो जाए
    await new Promise(resolve => setTimeout(resolve, 3000));

    const data = await page.evaluate(() => {
      // 🎥 video tag
      const video = document.querySelector("video");
      if (video && video.src) {
        return { type: "video", url: video.src };
      }

      // 🎥 meta video
      const metaVideo = document.querySelector('meta[property="og:video"]');
      if (metaVideo) {
        return { type: "video", url: metaVideo.content };
      }

      // 🖼️ image fallback
      const img = document.querySelector("img");
      if (img && img.src) {
        return { type: "image", url: img.src };
      }

      return null;
    });

    await browser.close();

    if (data) {
      if (data.type === "video") {
        res.send(`
          <h2>Video Found 🎥</h2>
          <video src="${data.url}" controls width="400"></video>
          <br><br>
          <a href="${data.url}" download>Download Video</a>
        `);
      } else {
        res.send(`
          <h2>Image Found 🖼️</h2>
          <img src="${data.url}" width="300"/>
          <br><br>
          <a href="${data.url}" download>Download Image</a>
        `);
      }
    } else {
      res.send("❌ Media not found. Try another link.");
    }

  } catch (err) {
    res.send("⚠️ Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started on " + PORT));
