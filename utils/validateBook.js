const Joi = require("joi");
const xss = require("xss");

const bookSchema = Joi.object({
  title: Joi.string().min(3).required(),
  author: Joi.string().min(3).required(),
  published_date: Joi.date().iso().required(),
  genre: Joi.string().min(3).required()
});

module.exports = (body) => {
  const { error } = bookSchema.validate(body);
  if (error) {
    throw {
      statusCode: 400,
      message: "Validation Error",
      details: error.details[0].message
    };
  }

  if (xss(body.title) !== body.title) {
    throw {
      statusCode: 400,
      message: "Invalid input detected",
      details: "XSS attempt blocked"
    };
  }

  return true; // If valid
};