const Joi = require("joi");

// checks whether the body contains user and post IDs
module.exports = body => {
  const schema = {
    postId: Joi.string().required(),
    userId: Joi.string().required()
  };

  return Joi.validate(body, schema);
};
