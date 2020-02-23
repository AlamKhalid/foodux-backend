const mongoose = require("mongoose");
const Joi = require("joi");

module.exports.commentSchema = new mongoose.Schema({
  commentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  commentBody: String
});

module.exports.validate = validateComment = comment => {
  const schema = {
    commentBody: Joi.string()
      .min(1)
      .required()
  };

  return Joi.validate(comment, schema);
};
