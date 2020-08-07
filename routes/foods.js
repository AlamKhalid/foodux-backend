require("express-async-errors");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Food = mongoose.model(
  "Food",
  new mongoose.Schema({
    name: String,
    profilePic: String,
  })
);

router.get("/", async (req, res) => {
  const foods = await Food.find();
  res.send(foods);
});

router.get("/:id", async (req, res) => {
  const food = await Food.findById(req.params.id);
  res.send(food);
});

router.put("/:id", async (req, res) => {
  const food = await Food.findById(req.params.id);
  food.name = req.body.name;
  food.profilePic = req.body.profilePic;
  await food.save();
  res.send(food);
});

router.post("/", async (req, res) => {
  const food = new Food({
    name: req.body.name,
    profilePic: req.body.profilePic,
  });
  await food.save();
  res.send(food);
});

router.delete("/:id", async (req, res) => {
  const food = await Food.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});

module.exports = router;
