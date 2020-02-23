require("express-async-errors");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const City = mongoose.model(
  "City",
  new mongoose.Schema({
    name: String
  })
);

router.get("/", async (req, res) => {
  const cities = await City.find();
  res.send(cities.map(city => city.name));
});

module.exports = router;
