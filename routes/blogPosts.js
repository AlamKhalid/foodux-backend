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

module.exports = router;
