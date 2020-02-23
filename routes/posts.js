require("express-async-errors");
const _ = require("lodash");
const express = require("express");
const { Post, validate } = require("../models/posts");
const { User } = require("../models/users");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(
    _.pick(req.body, ["postBody", "location", "amountSpend"])
  );
  if (error) return res.status(400).send(error.details[0].message);

  let post = new Post({
    body: req.body.postBody,
    location: req.body.location,
    amountSpend: req.body.amountSpend
  });

  await post.save();
  let user = await User.findById(req.body._id);
  user.posts.push(post._id);
  await user.save();
  res.send(post);
});

module.exports = router;
