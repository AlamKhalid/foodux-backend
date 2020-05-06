require("express-async-errors");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Type = mongoose.model(
  "Type",
  new mongoose.Schema({
    name: String,
  })
);

router.get("/", async (req, res) => {
  const types = await Type.find();
  res.send(types);
});

module.exports = router;
