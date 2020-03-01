const Joi = require("joi");

module.exports = body => {
  const schema = {
    postId: Joi.string().required(),
    commentId: Joi.string().required()
  };

  return Joi.validate(body, schema);
};
