require("express-async-errors");
const express = require("express");
const _ = require("lodash");
const { validate } = require("../models/comments");
const { Post } = require("../models/posts");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(_.pick(req.body, ["commentBody"]));
  if (error) return res.status(400).send(error.details[0].message);

  let post = await Post.findById(req.body.postId);
  post.comments.push({
    commentBody: req.body.commentBody,
    commentBy: req.body.userId
  });
  await post.save();
  res.send(post.comments);
});

module.exports = router;
