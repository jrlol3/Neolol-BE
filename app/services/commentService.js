const fs = require("fs");
const db = require("../models");
const { code, MAX_COMMENT_RETRIEVE_ON_PROFILE } = require("../constants");
const includes = require("../helpers/includeHelper");

const commentModel = db.comment;
const config = require("../config/config");
const { getFileType } = require("../utils/fileUtils");


async function getCommentOnly(postId) {
  try {
    return commentModel.findByPk(postId);
  } catch (error) {
    return { status: code.badRequest, error: error.message };
  }
}


exports.getComment = async function(postId, commentId, userId) {
  try {
    const comment = await commentModel.findOne({
      where: {
        deleted: false,
        post_fk: postId,
        comment_id: commentId,
      },
      ...includes.withoutNulls([
        includes.includeUserCommentVote(userId),
        includes.userOnComment(),
      ]),
    });
    if (comment != null) comment.setDataValue("replies", []);
    return comment;
  } catch (error) {
    return { status: code.badRequest, error: error.message };
  }
};


exports.getUserComments = async function(user, targetId, offset) {
  const userId = user && user.user_id;

  const query = {
    limit: MAX_COMMENT_RETRIEVE_ON_PROFILE,
    offset, // Serves as pagination
    ...includes.withoutNulls([
      includes.includeUserCommentVote(userId),
      includes.userOnComment(),
    ]),
    where: {
      user_fk: targetId,
    },
    order: [
      ["comment_id", "DESC"],
    ],
  };

  return commentModel.findAll(query);
};


async function updateHasReply(comment) {
  try {
    comment.has_reply = true;
    comment.save();
  } catch (error) {
    return { status: code.badRequest, error: error.message };
  }
}


async function newComment(userId, postId, content, parentData) {
  return commentModel.create({
    user_fk: userId,
    post_fk: postId,
    content,
    ...parentData,
  })
    .then((commented) => {
      return commented;
    })
    .catch((error) => {
      return { status: code.badRequest, error: error.message };
    });
}


exports.createComment = async function(user, postId, content, parentCommentId, file) {
  // eslint-disable-next-line no-useless-catch
  try {
    return db.sequelize.transaction(async (t) => {
      return commentModel.create({
        user_fk: user.user_id,
        post_fk: postId,
        content,
        parent_fk: parentCommentId,
        has_attachment: (!!file),
        attachment_extension: (file ? await getFileType(file.data) : undefined),
      }, { transaction: t });
    });
  } catch (e) {
    throw e;
  }
};


// todo create a single function to upload files, that takes the path as an argument
exports.saveCommentFileToDisk = async function saveCommentFileToDisk(commentFile, commentInstance) {
  // todo fix database circular import issue first, then move fs up
  const stream = fs.createWriteStream(`${config.cdnPath}/comment/${commentInstance.dataValues.comment_id}.${commentInstance.attachment_extension}`);
  stream.once("open", async () => {
    try {
      stream.write(commentFile.data);
      stream.end();
      stream.close();
    } catch (e) {
      stream.close();
      throw e;
    }
  });
};


exports.softDeleteComment = async (postId, commentId) => {
  return commentModel.softDeleteComment(postId, commentId);
};

exports.editCommentContent = async (commentId, content) => {
  return commentModel.editCommentContent(commentId, content);
};


exports.updateHasReply = updateHasReply;
exports.getCommentOnly = getCommentOnly;
exports.newComment = newComment;
