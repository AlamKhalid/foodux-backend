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
  isEditor: { type: Boolean, default: false },
  joinedOn: String,
  profilePic: String,
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
  blogPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "BlogPost" }],
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
  menuPic: String,
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
      pic: this.profilePic,
      isRestaurant: this.isRestaurant,
      isEditor: this.isEditor,
      isAdmin: this.isAdmin,
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
