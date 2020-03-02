const Joi = require("joi");

module.exports = body => {
  const schema = {
    commentId: Joi.string().required(),
    userId: Joi.string().required()
  };

  return Joi.validate(body, schema);
};
