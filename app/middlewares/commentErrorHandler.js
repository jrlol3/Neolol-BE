const { ValidationError } = require("sequelize");
const { CommentValidationError } = require("../helpers/validationError");
const { code } = require("../constants/messageConstants");

// todo create a more general error class that can be inherited by parts of the application
// eslint-disable-next-line no-unused-vars
module.exports = function (e, req, res, _next) {
  if (e instanceof CommentValidationError) {
    // the error is readable by the client already
    res.status(e.status).json(e.message);
  } else if (e instanceof ValidationError) {
    res.status(code.badRequest).json(e.message);
  } else {
    // this is the kind of error that appears in development, this branch of code should be removed in production
    console.log(e);
    res.status(code.internalServerError).json({ message: e.message, stack: e.stack });
  }
};