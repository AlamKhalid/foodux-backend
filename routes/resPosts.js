require("express-async-errors");
const _ = require("lodash");
const express = require("express");
const { Respost, validate } = require("../models/resPosts");
const { Restaurant } = require("../models/restaurants");
const router = express.Router();

router.get("/", async (req, res) => {
  const posts = await Respost.find().populate("postBy", "name");
  res.send(posts);
});

// get details of a specific post from the database
router.get("/:id", async (req, res) => {
  const post = await Respost.findById(req.params.id)
    .populate("postBy", "name")
    .populate("restaurant", "name")
    .populate("comments.commentBy", "name")
    .populate("likes", "name");
  res.send(post);
});

router.post("/", async (req, res) => {
  const post = new Respost({
    postBody: req.body.postBody,
    postType: req.body.postType,
    oldPrice: req.body.oldPrice,
    dealPrice: req.body.dealPrice,
    validOn: req.body.validOn,
    validTill: req.body.validTill,
    dealItems: [...req.body.dealItems],
    postBy: req.body.restaurant,
  });

  await post.save();
  const restaurant = await Restaurant.findById(req.body.restaurant);
  restaurant.posts.push(post._id);
  await restaurant.save();
  res.send(post);
});

router.delete("/", async (req, res) => {
  const restaurant = await Restaurant.findById(req.body.userId);
  restaurant.posts = restaurant.posts.filter((post) => post != req.body.postId);
  await restaurant.save();
  await Respost.findByIdAndDelete(req.body.postId);
  res.send(restaurant.posts);
});

module.exports = router;
