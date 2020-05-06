require("express-async-errors");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const Joi = require("joi");
const { User } = require("../models/users");
const router = express.Router();

// validates the user for login purpose
validate = (user) => {
  const schema = {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  };
  return Joi.validate(user, schema);
};

// route to login user after validating the credentials
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email");

  const details = user.isRestaurant ? user.phone : user.livesIn;

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid password");

  const token = user.generateAuthToken();
  res.send({ token, isVerified: user.isVerified, filledDetails: details });
  // send the jwt, which can be stored in local storage at front-end
});

module.exports = router;
