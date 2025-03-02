const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
});

module.exports = {
  createUserSchema,
};
