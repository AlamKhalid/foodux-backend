require("express-async-errors");
const _ = require("lodash");
const express = require("express");
const { BlogPost } = require("../models/blogPosts");
const { User } = require("../models/users");
const router = express.Router();

router.get("/", async (req, res) => {
  const blogPosts = await BlogPost.find().populate("postedBy", "name");
  res.send(blogPosts);
});

router.post("/", async (req, res) => {
  const blogPost = new BlogPost({
    title: req.body.title,
    postedBy: req.body.postedBy,
    body: req.body.value,
    img: req.body.img,
  });

  await blogPost.save();

  const user = await User.findById(req.body.postedBy);
  user.blogPosts.push(blogPost._id);
  await user.save();
  res.send(blogPost);
});

router.get("/:id", async (req, res) => {
  const post = await BlogPost.findById(req.params.id).populate(
    "postedBy",
    "name"
  );
  res.send(post);
});

router.put("/:id", async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  post.title = req.body.title;
  post.body = req.body.value;
  post.img = req.body.img;
  await post.save();
  res.send(post);
});

router.delete("/:id", async (req, res) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);
  res.send(post);
});

module.exports = router;
