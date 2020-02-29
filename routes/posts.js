require("express-async-errors");
const _ = require("lodash");
const express = require("express");
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
  if (posts.length > 0) res.send(posts);
  res.send("No posts to show");
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

module.exports = router;
