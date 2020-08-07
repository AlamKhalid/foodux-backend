require("express-async-errors");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const City = mongoose.model(
  "City",
  new mongoose.Schema({
    name: String,
    pic: String,
    subareas: Array,
  })
);

router.get("/", async (req, res) => {
  const cities = await City.find();
  res.send(cities);
});

router.get("/:id", async (req, res) => {
  const city = await City.findById(req.params.id);
  res.send(city);
});

router.post("/", async (req, res) => {
  const city = new City({
    name: req.body.name,
    subareas: req.body.subareas,
    pic: req.body.pic,
  });
  await city.save();
  res.send(city);
});

router.put("/:id", async (req, res) => {
  const city = await City.findById(req.params.id);
  city.name = req.body.name;
  city.pic = req.body.pic;
  city.subareas = req.body.subareas;
  await city.save();
  res.send(city);
});

router.delete("/:id", async (req, res) => {
  const city = await City.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});

module.exports = router;
