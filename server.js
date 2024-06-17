const express = require("express");
const http = require("https");
const axios = require("axios");
const Jimp = require("jimp");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "*", // Allow all origins
};

app.use(cors(corsOptions));

// Astronomy API

const AUTH_STRING = Buffer.from(
  `${process.env.ASTRONOMY_APP_ID}:${process.env.ASTRONOMY_APP_SECRET}`
).toString("base64");

// const unsplashAccesskey = process.env.UNSPLASH_ACCESS_KEY;

app.get("/moon-phase", async (req, res) => {
  // const query = req.query.query || "nature";
  try {
    const response = await axios.post(
      `https://api.astronomyapi.com/api/v2/studio/moon-phase`,
      {
        format: "png",
        style: {
          moonStyle: "default",
          backgroundStyle: "solid",
          backgroundColor: "black",
          headingColor: "black",
          textColor: "black",
        },
        observer: {
          latitude: 6.56774,
          longitude: 79.88956,
          date: "2020-11-01",
        },
        view: {
          type: "portrait-simple",
          orientation: "north-up",
        },
      },
      {
        headers: {
          Authorization: `Basic ${AUTH_STRING}`,
        },
      }
    );

    const imageUrl = response.data.data.imageUrl;

    const image_png = await Jimp.read(imageUrl);
    const buffer = await image_png.getBufferAsync(Jimp.MIME_BMP);

    res.set("Content-Type", Jimp.MIME_BMP);
    res.send(buffer);

    // ----- unsplash

    // const response = await axios.get(`https://api.unsplash.com/photos/random`, {
    //   params: { query },
    //   headers: {
    //     Authorization: `Client-ID ${unsplashAccesskey}`,
    //   },
    // });

    // const imageUrl = response.data.urls.full;

    // ----- unsplash
  } catch (error) {
    res.status(500).send(`Error fetching or processing the image ${error}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
