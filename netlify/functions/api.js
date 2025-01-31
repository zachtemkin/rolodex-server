import express from "express";
import serverless from "serverless-http";
import axios from "axios";
import Jimp from "jimp";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const api = express();
const router = express.Router();

// const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "*",
};

router.use(cors(corsOptions));

const getCurrentDate = () => {
  const currentDate = new Date();
  const dateString = currentDate.toISOString().split(".")[0];
  let parts = dateString.split(":");
  parts.pop();
  const formmatedDateString = parts.join(":");
  return formmatedDateString;
};

router.get("/moon-image", async (req, res) => {
  const date = getCurrentDate();

  try {
    const response = await axios.get(
      `https://svs.gsfc.nasa.gov/api/dialamoon/${date}`
    );

    const imageUrl = response.data.image.url;
    const originalImage = await Jimp.read(imageUrl);
    const resizedImage = originalImage.resize(480, 480, Jimp.RESIZE_BICUBIC);
    const buffer = await resizedImage.getBufferAsync(Jimp.MIME_BMP);

    res.set("Cache-Control", "public, max-age=300");
    res.set("Content-Type", "image/bmp");
    res.set("Content-Length", buffer.length);
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).send(`Error fetching data: ${error.message}`);
  }
});

router.get("/moon-image-pixelated", async (req, res) => {
  const date = getCurrentDate();
  console.log(date);

  try {
    const response = await axios.get(
      `https://svs.gsfc.nasa.gov/api/dialamoon/${date}`
    );

    const imageUrl = response.data.image.url;
    const originalImage = await Jimp.read(imageUrl);
    const shrunkenImage = originalImage.resize(32, 32, Jimp.RESIZE_BICUBIC);
    const pixelImage = shrunkenImage.resize(
      480,
      480,
      Jimp.RESIZE_NEAREST_NEIGHBOR
    );
    const buffer = await pixelImage.getBufferAsync(Jimp.MIME_BMP);

    res.set("Content-Type", Jimp.MIME_BMP);
    res.status(200).send(buffer);
  } catch (error) {
    res.status(500).send(`Error fetching data: ${error}`);
  }
});

router.get("/moon-image-small", async (req, res) => {
  const date = getCurrentDate();
  console.log(date);

  try {
    const response = await axios.get(
      `https://svs.gsfc.nasa.gov/api/dialamoon/${date}`
    );

    const imageUrl = response.data.image.url;
    const originalImage = await Jimp.read(imageUrl);
    const shrunkenImage = originalImage.resize(32, 32, Jimp.RESIZE_BICUBIC);
    const buffer = await shrunkenImage.getBufferAsync(Jimp.MIME_BMP);

    res.set("Content-Type", Jimp.MIME_BMP);
    res.status(200).send(buffer);
  } catch (error) {
    res.status(500).send(`Error fetching data: ${error}`);
  }
});

router.get("/moon-data", async (req, res) => {
  const date = getCurrentDate();

  try {
    const response = await axios.get(
      `https://svs.gsfc.nasa.gov/api/dialamoon/${date}`
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

router.get("/unsplash", async (req, res) => {
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

// api.listen(PORT, () => {
//   console.log(`Server is running on ${PORT}`);
// });

api.use("/api/", router);

export const handler = serverless(api);
