const express = require("express");
const axios = require("axios");
const sharp = require("sharp");
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

const unsplashAccesskey = process.env.UNSPLASH_ACCESS_KEY;

app.get("/moon-phase", async (req, res) => {
  const query = req.query.query || "nature";
  try {
    const response = await axios.post(
      `https://api.astronomyapi.com/api/v2/studio/star-chart`,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
          Host: "fcc.lol",
          Accept: "*/*",
          Authorization: `Basic ${AUTH_STRING}`,
        },
        body: {
          style: "red",
          observer: {
            latitude: 6.56774,
            longitude: 79.88956,
            date: "2020-11-01",
          },
          view: {
            type: "constellation",
            parameters: {
              constellation: "ori",
            },
          },
        },
      }
    );

    const imageUrl = response.data.imageUrl;

    // ---------------

    // ----- unsplash

    // const response = await axios.get(`https://api.unsplash.com/photos/random`, {
    //   params: { query },
    //   headers: {
    //     Authorization: `Client-ID ${unsplashAccesskey}`,
    //   },
    // });

    // const imageUrl = response.data.urls.full;

    // ----------------

    console.log(imageUrl);

    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    // console.log(imageResponse);

    const buffer = Buffer.from(imageResponse.data, "binary");

    sharp(buffer)
      .toFormat("bmp")
      .toBuffer((err, data) => {
        if (err) {
          return res.status(500).send("Error converting image to bitmap");
        }

        res.set("Content-Type", "image/bmp");
        res.send(data);
      });
  } catch (error) {
    res.status(500).send(`Error fetching or processing the image ${error}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
