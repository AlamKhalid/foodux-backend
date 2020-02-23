require("express-async-errors");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
const { User } = require("../models/users");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  const token = user.generateAuthToken();
  res.send(token);
});

validate = user => {
  const schema = {
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().required()
  };

  return Joi.validate(user, schema);
};

module.exports = router;
