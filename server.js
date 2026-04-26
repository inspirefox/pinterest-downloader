const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const app = express();
app.use(express.urlencoded({ extended: true }));

// 🔹 Home Page
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

// 🔥 DOWNLOAD ROUTE (NETWORK BASED)
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

    let videoUrl = null;

    // 📡 Network sniffing
    page.on("response", async (response) => {
      try {
        const requestUrl = response.url();

        if (requestUrl.includes("video_list")) {
          const text = await response.text();

          const match = text.match(/"video_list":(.*?),"image_cover"/);

          if (match && match[1]) {
            const json = JSON.parse(match[1]);

            for (let key in json) {
              if (json[key].url) {
                videoUrl = json[key].url;
              }
            }
          }
        }
      } catch (e) {}
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    // थोड़ा wait ताकि API call आ जाए
    await new Promise((r) => setTimeout(r, 5000));

    await browser.close();

    if (videoUrl) {
      res.send(`
        <h2>Video Found 🎥</h2>
        <video src="${videoUrl}" controls width="400"></video>
        <br><br>
        <a href="${videoUrl}" download>Download Video</a>
      `);
    } else {
      res.send("❌ Video not found. Try another pin.");
    }

  } catch (err) {
    res.send("⚠️ Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started on " + PORT));
