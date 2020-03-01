require("express-async-errors");
const express = require("express");
const _ = require("lodash");
const validateUserPostIds = require("../helper/validateUserPostIds");
const { Post } = require("../models/posts");
const { User } = require("../models/users");
const router = express.Router();

router.get("/:id/posts", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user.likedPosts);
});

router.post("/inc", async (req, res) => {
  const { error } = validateUserPostIds(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const post = await Post.findById(req.body.postId);
  if (post.likes.indexOf(req.body.userId) > -1)
    return res.status(400).send("User already has liked the post");

  post.likes.push(req.body.userId);
  const user = await User.findById(req.body.userId);
  user.likedPosts.push(req.body.postId);

  await post.save();
  await user.save();

  res.send(post);
});

router.post("/dec", async (req, res) => {
  const { error } = validateUserPostIds(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const post = await Post.findById(req.body.postId);
  let index = post.likes.indexOf(req.body.userId);
  if (index === -1) return res.status(400).send("User has not liked the post");

  post.likes.splice(index, 1);
  const user = await User.findById(req.body.userId);
  index = user.likedPosts.indexOf(req.body.postId);
  user.likedPosts.splice(index, 1);

  await post.save();
  await user.save();

  res.send(post);
});

module.exports = router;
