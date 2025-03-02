const validate = (schema) => (req, res, next) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
