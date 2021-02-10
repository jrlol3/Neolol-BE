const { code } = require("../constants/messageConstants");
// eslint-disable-next-line max-classes-per-file
class PostValidationError extends Error {
  constructor({ message, status = code.badRequest }) {
    super();
    this.message = message;
    this.status = status;
  }
}

class CommentValidationError extends Error {
  constructor(message, status = code.badRequest) {
    super();
    this.message = message;
    this.status = status;
  }
}

class UserValidationError extends Error {
  constructor(message, status = code.badRequest) {
    super();
    this.message = message;
    this.status = status;
  }
}
module.exports.PostValidationError = PostValidationError;
module.exports.CommentValidationError = CommentValidationError;
module.exports.UserValidationError = UserValidationError;
