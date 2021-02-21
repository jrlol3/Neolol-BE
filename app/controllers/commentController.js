const { validationResult } = require("express-validator");
const { msg, code } = require("../constants");
const { createComment, getUserComments, saveCommentFileToDisk, softDeleteComment, editCommentContent } = require("../services/commentService");
const userService = require("../services/userService");
const repliesService = require("../services/repliesService");
const { CommentValidationError } = require("../helpers/validationError");

exports.create = async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CommentValidationError(errors.mapped());
    }

    const user = req.verified;
    const { content, parentCommentId } = req.body;
    const { postId } = req.params;
    const file = req.files && req.files.files;

    const comment = await createComment(user, postId, content, parentCommentId, file);
    if (file)
      await saveCommentFileToDisk(file, comment);
    return res.status(code.created).json({
      comment,
    });
  } catch (e) {
    next(e);
  }
};


// This is for when the comments of a post are opened from a provenance page
exports.getFromPost = async function getFromPost(req, res, next) {
  const { postId } = req.params;
  const userId = req.verified && req.verified.user_id;
  const { depth } = req.query;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CommentValidationError(errors.mapped());
    }
    const comments = await repliesService.getCommentsFromPost(postId, userId, depth);
    if (comments.length === 0)
      return res.status(code.noContent).send();
    return res.status(code.success).send(comments);
  } catch (e) {
    next(e);
  }
};


// This is for when a single comment is opened, you can also get more replies with it
exports.getCommentWithReplies = async function getCommentWithReplies(req, res, next) {
  const userId = req.verified && req.verified.user_id;
  const { postId, commentId } = req.params;
  const { depth } = req.query;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CommentValidationError(errors.mapped());
    }

    const comments = await repliesService.getRepliesFromComment(commentId, userId, postId, depth);
    return res.status(200).send(comments);
  } catch (e) {
    console.log(e);
    next(e);
  }
};


exports.getOnProfile = async function (req, res, next) {
  const userId = req.verified && req.verified.user_id;
  const { username, offset } = req.params;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CommentValidationError(errors.mapped());
    }

    const targetUser = await userService.getUserSimple(username);
    if (!targetUser)
      return res.status(code.notFound).send(msg.notFound);

    const comments = await getUserComments(userId, targetUser.user_id, +offset || 0);
    return res.status(code.success).send(comments);
  } catch (e) {
    console.log(e);
    next(e);
  }
};


exports.deleteComment = async (req, res, next) => {
  const userId = req.verified.user_id;
  const { postId, commentId } = req.params;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CommentValidationError(errors.mapped());
    }
    const deletedComment = await softDeleteComment(+postId, +commentId);
    if (!deletedComment)
      return res.status(code.notFound).send(msg.notFound);

    return res.status(code.success).send(deletedComment);
  } catch (e) {
    console.log(e);
    next(e);
  }
};


exports.editCommentContent = async (req, res, next) => {
  if (!req.verified)
    return res.status(code.notAuthenticated).send(msg.notAuthenticated);

  // We'd like to keep these unused variables in case we might need them
  // in the future, most likely in a service, where we'd call some other API's
  // for logging, performance tracking and so on
  const userId = req.verified.user_id;
  const { postId, commentId } = req.params;
  const { content } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CommentValidationError(errors.mapped());
    }
    const newComment = await editCommentContent(commentId, content);
    if (!newComment)
      return res.status(code.notFound).send(msg.notFound);

    return res.status(code.success).send(newComment);
  } catch (e) {
    console.log(e);
    next(e);
  }
};
