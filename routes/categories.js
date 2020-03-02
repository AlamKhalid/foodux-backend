require("express-async-errors");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Category = mongoose.model(
  "Category",
  new mongoose.Schema({
    name: String
  })
);

router.get("/", async (req, res) => {
  const categories = await Category.find();
  res.send(categories);
});

module.exports = router;
