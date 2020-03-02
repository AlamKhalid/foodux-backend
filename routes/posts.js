require("express-async-errors");
const _ = require("lodash");
const express = require("express");
const validateUserPostIds = require("../helper/validateUserPostIds");
const { Post, validate } = require("../models/posts");
const { User } = require("../models/users");
const router = express.Router();

router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id)
    .select("location amountSpend postBy postBody time comments likes")
    .populate("postBy", "name")
    .populate("comments.commentBy", "name")
    .populate("likes", "name");
  res.send(post);
});

router.get("/", async (req, res) => {
  let posts = await Post.find()
    .select("location amountSpend postBy postBody time comments likes")
    .populate("postBy", "name")
    .populate("comments.commentBy", "name")
    .populate("likes", "name")
    .sort("-date -time");
  res.send(posts);
});

router.post("/", async (req, res) => {
  const { error } = validate(
    _.pick(req.body, ["postBody", "location", "amountSpend"])
  );
  if (error) return res.status(400).send(error.details[0].message);

  let post = new Post({
    postBody: req.body.postBody,
    location: req.body.location,
    amountSpend: req.body.amountSpend,
    postBy: req.body._id
  });

  await post.save();
  let user = await User.findById(req.body._id);
  user.posts.push(post._id);
  await user.save();
  res.send(post);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(
    _.pick(req.body, ["postBody", "location", "amountSpend"])
  );
  if (error) return res.status(400).send(error.details[0].message);

  const post = await Post.findById(req.params.id);

  post.postBody = req.body.postBody;
  post.location = req.body.location;
  post.amountSpend = req.body.amountSpend;

  await post.save();
  res.send(post);
});

router.delete("/", async (req, res) => {
  const { error } = validateUserPostIds(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.userId);
  user.posts = user.posts.filter(post => post != req.body.postId);
  await user.save();
  await Post.findByIdAndDelete(req.body.postId);
  res.send(user.posts);
});

module.exports = router;
