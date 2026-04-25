const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/download', async (req, res) => {
  const url = req.body.url;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox','--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    // Try multiple selectors
    const data = await page.evaluate(() => {

      let video = document.querySelector('video');
      if (video && video.src) {
        return { type: "video", url: video.src };
      }

      // fallback: meta tag
      let meta = document.querySelector('meta[property="og:video"]');
      if (meta) {
        return { type: "video", url: meta.content };
      }

      // fallback: image
      let img = document.querySelector('img');
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
      res.send("❌ Media not found");
    }

  } catch (err) {
    res.send("⚠️ Error: " + err.message);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});