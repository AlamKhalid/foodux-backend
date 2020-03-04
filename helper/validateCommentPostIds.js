const Joi = require("joi");

// validates if the body contains comment and post IDs
module.exports = body => {
  const schema = {
    postId: Joi.string().required(),
    commentId: Joi.string().required()
  };

  return Joi.validate(body, schema);
};
