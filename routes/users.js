require("express-async-errors");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const validateUserPostIds = require("../helper/validateUserPostIds");
const validateUserCommentIds = require("../helper/validateUserCommentIds");
const { User, validate } = require("../models/users");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already exists");

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    birthday: req.body.birthday,
    gender: req.body.gender
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["name", "email"]));
});

router.get("/:id/hidden-posts", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user.hiddenPosts);
});

router.get("/:id/posts", async (req, res) => {
  const userPosts = await User.findById(req.params.id).select("posts");
  return res.send(userPosts.posts);
});

router.get("/:id/saved-posts", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user.savedPosts);
});

router.get("/:id/hidden-comments", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user.hiddenComments);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user);
});

router.post("/save-post/add", async (req, res) => {
  const { error } = validateUserPostIds(req.body);
  if (error) return res.status(400).send(error.detials[0].message);

  const user = await User.findById(req.body.userId);
  const index = user.savedPosts.indexOf(req.body.postId);
  if (index > -1) return res.send("Post is already saved");

  user.savedPosts.push(req.body.postId);
  await user.save();
  res.send(user.savedPosts);
});

router.post("/save-post/remove", async (req, res) => {
  const { error } = validateUserPostIds(req.body);
  if (error) return res.status(400).send(error.detials[0].message);

  const user = await User.findById(req.body.userId);
  const index = user.savedPosts.indexOf(req.body.postId);
  if (index === -1) return res.send("Post is already unsaved");

  user.savedPosts.splice(index, 1);
  await user.save();
  res.send(user.savedPosts);
});

router.post("/hidden-post/add", async (req, res) => {
  const { error } = validateUserPostIds(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.userId);
  if (user.hiddenPosts.indexOf(req.body.postId) > -1)
    return res.status(400).send("Post already hidden");

  user.hiddenPosts.push(req.body.postId);
  await user.save();
  res.send(user.hiddenPosts);
});

router.post("/hidden-post/remove", async (req, res) => {
  const { error } = validateUserPostIds(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.userId);
  const index = user.hiddenPosts.indexOf(req.body.postId);
  if (index === -1) return res.status(400).send("Post is not hidden");

  user.hiddenPosts.splice(index, 1);
  await user.save();
  res.send(user.hiddenPosts);
});

router.post("/hidden-comment/add", async (req, res) => {
  const { error } = validateUserCommentIds(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.userId);
  const index = user.hiddenComments.indexOf(req.body.commentId);
  if (index !== -1) return res.status(400).send("Comment already hidden");

  user.hiddenComments.push(req.body.commentId);
  await user.save();

  res.send(user.hiddenComments);
});

router.post("/hidden-comment/remove", async (req, res) => {
  const { error } = validateUserCommentIds(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.userId);
  const index = user.hiddenComments.indexOf(req.body.commentId);
  if (index === -1) return res.status(400).send("Comment is not hidden");

  user.hiddenComments.splice(index, 1);
  await user.save();

  res.send(user.hiddenComments);
});

module.exports = router;
