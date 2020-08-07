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

router.get("/:id", async (req, res) => {
  const type = await Type.findById(req.params.id);
  res.send(type);
});

router.post("/", async (req, res) => {
  const type = new Type({
    name: req.body.name,
  });
  await type.save();
  res.send(type);
});

router.put("/:id", async (req, res) => {
  const type = await Type.findById(req.params.id);
  type.name = req.body.name;
  await type.save();
  res.send(type);
});

router.delete("/:id", async (req, res) => {
  await Type.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});

module.exports = router;
