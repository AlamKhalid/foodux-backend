require("express-async-errors");
const express = require("express");
const _ = require("lodash");
const { Post } = require("../models/posts");
const router = express.Router();

router.post("/", async (req, res) => {
  const post = await Post.findById(req.body.postId);
  post.comments.push({
    commentBody: req.body.commentBody,
    commentBy: req.body.userId,
  });
  if (req.body.userId !== post.postBy) {
    const postUser = await User.findById(post.postBy);
    postUser.notifications.unshift({
      doneBy: req.body.userId,
      notType: "commented on",
    });
    await postUser.save();
  }

  await post.save();
  res.send(post);
});

router.put("/", async (req, res) => {
  const post = await Post.findById(req.body.postId);
  post.comments.forEach(function (comment) {
    if (comment._id == req.body.commentId)
      comment.commentBody = req.body.commentBody;
  });
  await post.save();
  res.send(post.comments);
});

router.delete("/", async (req, res) => {
  const post = await Post.findById(req.body.postId);
  const index = post.comments.indexOf(req.body.commentId);
  post.comments.splice(index, 1);
  await post.save();

  res.send(post);
});

module.exports = router;
