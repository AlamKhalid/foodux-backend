require("express-async-errors");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Food = mongoose.model(
  "Food",
  new mongoose.Schema({
    name: String,
  })
);

router.get("/", async (req, res) => {
  const foods = await Food.find();
  res.send(foods);
});

module.exports = router;
