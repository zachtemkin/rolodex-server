const express = require("express");
const http = require("https");
const axios = require("axios");
const Jimp = require("jimp");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

const currentDate = new Date();

app.get("/moon-image", async (req, res) => {
  const dateString = currentDate.toISOString().split(".")[0];
  let parts = dateString.split(":");
  parts.pop();
  const formmatedDateString = parts.join(":");

  try {
    const response = await axios.get(
      `https://svs.gsfc.nasa.gov/api/dialamoon/${formmatedDateString}`
    );

    const imageUrl = response.data.image.url;
    const originalImage = await Jimp.read(imageUrl);
    const resizedImage = originalImage.resize(480, 480, Jimp.RESIZE_BICUBIC);
    const buffer = await resizedImage.getBufferAsync(Jimp.MIME_BMP);

    res.set("Content-Type", Jimp.MIME_BMP);
    res.status(200).send(buffer);
  } catch (error) {
    res.status(500).send(`Error fetching data: ${error}`);
  }
});

app.get("/moon-data", async (req, res) => {
  const dateString = currentDate.toISOString().split(".")[0];
  let parts = dateString.split(":");
  parts.pop();
  const formmatedDateString = parts.join(":");

  try {
    const response = await axios.get(
      `https://svs.gsfc.nasa.gov/api/dialamoon/${formmatedDateString}`
    );

    const data = response.data;
    const { time, phase, obscuration, age } = data;

    const moonInfo = {
      time: time,
      phase: phase,
      obscuration: obscuration,
      age: age,
    };

    res.set("Content-Type", "application/json");
    res.status(200).send(moonInfo);
  } catch (error) {
    res.status(500).send(`Error fetching data: ${error}`);
  }
});

const unsplashAccesskey = process.env.UNSPLASH_ACCESS_KEY;

app.get("/unsplash", async (req, res) => {
  const query = req.query.query || "moon";
  try {
    const response = await axios.get(`https://api.unsplash.com/photos/random`, {
      params: { query, orientation: "squarish" },
      headers: {
        Authorization: `Client-ID ${unsplashAccesskey}`,
      },
    });
    const imageUrl = response.data.urls.small;
    const image_png = await Jimp.read(imageUrl);
    const cropOptions = {
      tolerance: "0px",
      cropSymmetric: true,
      leaveBorder: false,
    };
    const image_cropped = image_png
      .autocrop(cropOptions)
      .resize(480, 480, Jimp.RESIZE_BICUBIC);
    const buffer = await image_cropped.getBufferAsync(Jimp.MIME_BMP);

    res.set("Content-Type", Jimp.MIME_BMP);
    res.send(buffer);
  } catch (error) {
    res.status(500).send(`Error getting image ${error}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
