require("express-async-errors");
const _ = require("lodash");
const express = require("express");
const validateUserPostIds = require("../helper/validateUserPostIds");
const { Userpost, validate } = require("../models/userPosts");
const { User } = require("../models/users");
const router = express.Router();

// get details of a specific post from the database
router.get("/:id", async (req, res) => {
  const post = await Userpost.findById(req.params.id)
    .populate("postBy", "name")
    .populate("restaurant", "name")
    .populate("comments.commentBy", "name")
    .populate("likes", "name");
  res.send(post);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(
    _.pick(req.body, [
      "postBody",
      "location",
      "amountSpend",
      "restaurant",
      "opinion",
      "serviceRating",
      "tasteRating",
      "ambienceRating",
      "overallRating",
    ])
  );
  if (error) return res.status(400).send(error.details[0].message);

  const post = await Userpost.findById(req.params.id);
  post.postBody = req.body.postBody;
  post.location = req.body.location;
  post.amountSpend = req.body.amountSpend;

  await post.save();
  res.send(post);
});

// get all posts from the database
router.get("/", async (req, res) => {
  let posts = await Userpost.find()
    .populate("postBy", "name")
    .populate("restaurant", "name")
    .populate("comments.commentBy", "name")
    .populate("likes", "name")
    .sort("-date -time");
  res.send(posts);
});

router.post("/", async (req, res) => {
  const { error } = validate(
    _.pick(req.body, [
      "postBody",
      "location",
      "amountSpend",
      "restaurant",
      "opinion",
      "serviceRating",
      "tasteRating",
      "ambienceRating",
      "overallRating",
    ])
  );
  if (error) return res.status(400).send(error.details[0].message);

  let post = new Userpost({
    postBody: req.body.postBody,
    location: req.body.location,
    amountSpend: req.body.amountSpend,
    restaurant: req.body.restaurant,
    ateFood: [...req.body.ateFood],
    opinion: req.body.opinion,
    tasteRating: req.body.tasteRating,
    serviceRating: req.body.serviceRating,
    ambienceRating: req.body.ambienceRating,
    overallRating: req.body.overallRating,
    postType: req.body.postType,
    postBy: req.body._id,
  });

  await post.save();
  let user = await User.findById(req.body._id);
  user.posts.push(post._id);
  const restaurant = user.restaurantsVisited.find(
    (rest) => rest.restaurantId === req.body.restaurant
  );
  if (restaurant) {
    const index = user.restaurantsVisited.indexOf(restaurant);
    user.restaurantsVisited[index].times += 1;
  } else {
    user.restaurantsVisited.push({
      restaurantId: req.body.restaurant,
      times: 1,
    });
  }
  await user.save();
  res.send(post);
});

router.delete("/", async (req, res) => {
  const { error } = validateUserPostIds(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.userId);
  user.posts = user.posts.filter((post) => post != req.body.postId);
  await user.save();
  await Userpost.findByIdAndDelete(req.body.postId);
  res.send(user.posts);
});

module.exports = router;
