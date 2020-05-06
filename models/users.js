const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isRestaurant: Boolean,
  joinedOn: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  hiddenPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  hiddenComments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Post.comments" },
  ],
  savedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  likedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  // start of user attributes
  bio: { type: String, trim: true },
  birthday: String,
  gender: { type: String, enum: ["male", "female"] },
  livesIn: { type: mongoose.Schema.Types.ObjectId, ref: "City" },
  favFood: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
  favRestaurant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restaurantsVisited: [
    {
      restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      times: Number,
    },
  ],
  // start of restaurant attributes
  website: String,
  phone: String,
  type: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
    },
  ],
  serves: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
    },
  ],
  branches: [
    {
      city: String,
      subareas: [String],
    },
  ],
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      isRestaurant: this.isRestaurant,
    },
    config.get("jwtPrivateKey")
  );
};

const User = mongoose.model("User", userSchema);

validateUser = (user) => {
  const schema = {
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  };

  return Joi.validate(user, schema);
};

module.exports.User = User;
module.exports.validate = validateUser;
