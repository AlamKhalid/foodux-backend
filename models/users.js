const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  birthday: { type: String, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ]
});

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { _id: this._id, name: this.name, email: this.email },
    config.get("jwtPrivateKey")
  );
};

const User = mongoose.model("User", userSchema);

validateUser = user => {
  const schema = {
    name: Joi.string().required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().required(),
    birthday: Joi.string().required(),
    gender: Joi.string().required()
  };

  return Joi.validate(user, schema);
};

module.exports.User = User;
module.exports.validate = validateUser;
