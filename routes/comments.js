require("express-async-errors");
const express = require("express");
const _ = require("lodash");
const { validate } = require("../models/comments");
const validateCommentPostIds = require("../helper/validateCommentPostIds");
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
  res.send(post);
});

router.put("/", async (req, res) => {
  const { error } = validateCommentPostIds(
    _.pick(req.body, ["postId", "commentId"])
  );
  if (error) return res.status(400).send(error.details[0].message);

  const post = await Post.findById(req.body.postId);
  post.comments.forEach(function(comment) {
    if (comment._id == req.body.commentId)
      comment.commentBody = req.body.commentBody;
  });
  await post.save();
  res.send(post.comments);
});

router.delete("/", async (req, res) => {
  const { error } = validateCommentPostIds(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const post = await Post.findById(req.body.postId);
  const index = post.comments.indexOf(req.body.commentId);
  post.comments.splice(index, 1);
  await post.save();

  res.send(post);
});

module.exports = router;
