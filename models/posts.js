const mongoose = require("mongoose");
const Joi = require("joi");
const { getDate, getTime } = require("../helper/date");

const postSchema = new mongoose.Schema({
  postBody: String,
  location: String,
  amountSpend: String,
  date: { type: String, default: getDate },
  time: { type: String, default: getTime }
});

const Post = mongoose.model("Post", postSchema);

validatePost = post => {
  const schema = {
    postBody: Joi.string()
      .min(1)
      .required(),
    location: Joi.string()
      .min(1)
      .required(),
    amountSpend: Joi.string()
      .min(1)
      .required()
  };

  return Joi.validate(post, schema);
};

module.exports.Post = Post;
module.exports.validate = validatePost;
