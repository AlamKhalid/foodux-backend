const Joi = require("joi");

// validates if the body contains the required user and comment IDs
module.exports = body => {
  const schema = {
    commentId: Joi.string().required(),
    userId: Joi.string().required()
  };

  return Joi.validate(body, schema);
};
