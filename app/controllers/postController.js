const{ validationResult } = require("express-validator");
const { ValidationError } = require("sequelize");
const service = require("../services/postService");
const repliesService = require("../services/repliesService");
const postService = require("../services/postService");
const userService = require("../services/userService");
const { provenances, code, DEFAULT_COMMENT_DEPTH, msg } = require("../constants");
const { PostValidationError } = require("../helpers/validationError");
const validator = require("../helpers/postValidator");
const check = require("../helpers/checksHelper");


exports.uploadPost = async function (req, res, next) {
  try {
    if (req.body.options) {
      req.body.options = JSON.parse(req.body.options);
    }
    validator.validatePostUpload(req.body.title, req.files);
    const user = await userService.getUserSimple(req.verified.username);
    const post = await postService.createPostInDB(user, req.files, req.body.title, req.body.options);
    await postService.savePostToDisk(req.files.files, post);
    res.status(code.success).json({
      msg: msg.success,
      post,
    });
  } catch (e) {
    // here we will take action depending on error type
    if (e instanceof PostValidationError) {
      // do nothing, because no changes where done
      next(e);
    } else if (e instanceof ValidationError) {
      // do nothing, so far what's done in the model gets rollbacked automagically
      next(e);
    } else {
      // something failed horribly, but the error handler will *ahem* handle it
      next(e);
    }
  }
};


exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new PostValidationError(errors.mapped());
    }

    const deletedPost = await postService.deletePost(postId);

    return res.status(200).send(deletedPost);
  } catch (e) {
    console.log(e);
    next(e);
  }
};


exports.editPostTitle = async (req, res, next) => {
  // We'd like to keep these unused variables in case we need them
  // in the future, most likely in a service, where we'd call some other API's
  // for logging, performance tracking and so on

  // eslint-disable-next-line
  const userId = req.verified && req.verified.user_id;
  const { postId } = req.params;
  const { title } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new PostValidationError(errors.mapped());
    }
    const editedPost = await postService.editPostTitle(postId, title);
    return res.status(200).send(editedPost);
  } catch (e) {
    console.log(e);
    next(e);
  }
};


// Get single post with comments
exports.get = async function(req, res) {
  const userId = req.verified && req.verified.user_id;
  const { postId } = req.params;
  let { depth } = req.query;

  if (postId && !check.isNumber(postId)) {
    return res.status(code.notFound).json({});
  }
  if (!check.isNumber(depth))
    depth = DEFAULT_COMMENT_DEPTH;

  const result = await service.getPost(req.verified, postId);
  if (!result) return res.status(code.notFound).json({});

  const comments = await repliesService.getCommentsFromPost(postId, userId, depth);
  result.setDataValue("comments", comments);
  return res.status(code.success).json(result);
};


exports.getOnProfile = async function(req, res, next) {
  const user = req.verified;
  const { username, offset } = req.params;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new PostValidationError(errors.mapped());
    }

    const targetUser = await userService.getUserSimple(username);
    if (!targetUser)
      return res.status(code.notFound).send(msg.notFound);

    const result = await service.getPostsOnProfile(user, targetUser.user_id, +offset || 0);

    if (!result) return res.status(code.notFound).json({});
    return res.status(code.success).json(result);

  } catch (e) {
    console.log(e);
    next(e);
  }
};


// All posts in a provenance
async function getAll(req, res) {
  const { provenance, after } = req.params;

  if (after && !check.isNumber(after)) {
    return res.status(code.notFound).json({});
  }

  const result = await service.getAllPosts(req.verified, provenance, after);

  if (!result) return res.status(code.notFound).json({});
  return res.status(code.success).json(result);
}

exports.getFrontPosts = async function(req, res) {
  req.params.provenance = provenances.FRONT.name;
  return getAll(req, res);
};

exports.getRisingPosts = async function(req, res) {
  req.params.provenance = provenances.RISING.name;
  return getAll(req, res);
};

exports.getFreshPosts = async function(req, res) {
  req.params.provenance = provenances.FRESH.name;
  return getAll(req, res);
};
