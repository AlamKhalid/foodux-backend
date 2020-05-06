require("express-async-errors");
const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { Restaurant, validate } = require("../models/restaurants");
const { getJoinedDate } = require("../helper/date");
const router = express.Router();

router.get("/", async (req, res) => {
  const restaurants = await Restaurant.find().select("name");
  res.send(restaurants);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let restaurant = await Restaurant.findOne({ email: req.body.email });
  if (restaurant) return res.status(400).send("Restaurant already exists");

  restaurant = new Restaurant({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    website: req.body.website,
  });

  const salt = await bcrypt.genSalt(10);
  restaurant.password = await bcrypt.hash(restaurant.password, salt);
  restaurant.joinedOn = getJoinedDate();
  await restaurant.save();
  const token = restaurant.generateAuthToken();

  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(restaurant, ["name", "email"]));
});

router.get("/:id/verify", async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  restaurant.isVerified = true;
  await restaurant.save();
  res.send(restaurant.isVerified);
});

router.get("/:id/hidden-posts", async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  res.send(restaurant.hiddenPosts);
});

router.get("/:id/hidden-comments", async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  res.send(restaurant.hiddenComments);
});

router.get("/:id", async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  res.send(restaurant);
});

router.get("/:id/get-branch-city", async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).select(
    "branches -_id"
  );
  res.send(restaurant.branches);
});

router.get("/:id/get-serves", async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)
    .select("serves -_id")
    .populate("serves", "name");
  res.send(restaurant.serves);
});

router.get("/:id/posts", async (req, res) => {
  const resPosts = await Restaurant.findById(req.params.id).select("posts");
  return res.send(resPosts.posts);
});

router.post("/:id/add-details", async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  restaurant.branches = req.body.branches;
  restaurant.type = req.body.type;
  restaurant.phone = req.body.phone;
  restaurant.serves = req.body.serves;
  await restaurant.save();
  res.send(restaurant);
});

router.post("/hidden-post/add", async (req, res) => {
  const rest = await Restaurant.findById(req.body.userId);
  if (rest.hiddenPosts.indexOf(req.body.postId) > -1)
    return res.status(400).send("Post already hidden");

  rest.hiddenPosts.push(req.body.postId);
  await rest.save();
  res.send(res.hiddenPosts);
});

router.post("/hidden-post/remove", async (req, res) => {
  const rest = await Restaurant.findById(req.body.userId);
  const index = rest.hiddenPosts.indexOf(req.body.postId);
  if (index === -1) return res.status(400).send("Post is not hidden");

  rest.hiddenPosts.splice(index, 1);
  await rest.save();
  res.send(res.hiddenPosts);
});

router.post("/hidden-comment/add", async (req, res) => {
  const rest = await Resttaurant.findById(req.body.userId);
  const index = rest.hiddenComments.indexOf(req.body.commentId);
  if (index !== -1) return res.status(400).send("Comment already hidden");

  rest.hiddenComments.push(req.body.commentId);
  await rest.save();

  res.send(rest.hiddenComments);
});

router.post("/hidden-comment/remove", async (req, res) => {
  const rest = await Restaurant.findById(req.body.userId);
  const index = rest.hiddenComments.indexOf(req.body.commentId);
  if (index === -1) return res.status(400).send("Comment is not hidden");

  rest.hiddenComments.splice(index, 1);
  await rest.save();

  res.send(rest.hiddenComments);
});

module.exports = router;
