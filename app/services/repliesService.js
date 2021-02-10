const { DEFAULT_COMMENT_DEPTH, NEGATIVE_HIDDEN_COMMENT_SCORE } = require("../constants/commentConstants");
const db = require("../models");
const { CommentValidationError } = require("../helpers/validationError");
const { code } = require("../constants/messageConstants");

const commentModel = db.comment;
const postModel = db.post;

function hideFieldsOfDeletedComment(comment) {
  comment.user_fk = -1;
  comment.content = "[deleted]";
  comment.has_attachment = 0;
  comment.user = {
    username: "[deleted]",
    nickname: "[deleted]",
    avatar: null,
    isMod: 0,
    is_admin: 0,
  };
  return comment;
}


function buildTree(flatComments, singleRootId = null) {
  const comments = {};
  const roots = [];

  // Goes through comments to index and mark them as roots
  for (let i = 0; i < flatComments.length; i += 1) {
    // Skips deleted comments without replies
    if (!flatComments[i].dataValues.deleted || flatComments[i].dataValues.has_reply) {
      if (flatComments[i].dataValues.deleted)
        flatComments[i] = hideFieldsOfDeletedComment(flatComments[i]);
      flatComments[i].dataValues.replies = [];
      // Marks negative comments with a hidden value
      const hidden = flatComments[i].dataValues.score <= NEGATIVE_HIDDEN_COMMENT_SCORE;
      flatComments[i].hidden = hidden;
      comments[flatComments[i].dataValues.comment_id] = flatComments[i];
      // Makes a copy of the comments that are not replies, thus the roots
      if (!singleRootId && flatComments[i].dataValues.reply_depth === 0) {
        if (flatComments[i].dataValues.reply_depth === 0)
          roots.push(flatComments[i]);
      }
      // Or gets the single comment that has the replies we want
      else if (+singleRootId === flatComments[i].dataValues.comment_id)
        roots.push(flatComments[i]);
    }
  }
  // Goes through every post again, nesting replies
  for (let i = 0; i < flatComments.length; i += 1) {
    const id = flatComments[i].dataValues.comment_id;
    const comment = comments[id];
    // Only checks comments older than the root
    const skip = (!comment || (singleRootId && id <= singleRootId));
    if (!skip && comment.dataValues.reply_depth > 0) {
      // Nests a shallow copy of the comment on the parent
      const parent = comments[comment.dataValues.parent_fk];
      if (parent) {
        const { dataValues } = parent;
        const { replies } = dataValues;
        parent.dataValues.replies = [...replies, comment];
      }
    }
  }
  // Those shallow copies made on that first iteration were also changed
  // So, returning the copies of the non-reply comments means no duplicates
  return roots;
}

exports.getCommentsFromPost = async function(postId, userId, maxDepth = DEFAULT_COMMENT_DEPTH) {
  const postModelInstance = await postModel.findByPk(postId);
  if (!postModelInstance)
    throw new CommentValidationError("there is no post with this Id!", code.notFound);
  const postComments = await commentModel.getCommentsFromAPost(postId, userId, maxDepth);
  return buildTree(postComments);
};


exports.getRepliesFromComment = async function(rootCommentId, userId, postId, maxDepthIncrease = DEFAULT_COMMENT_DEPTH) {
  const flatComments = await commentModel.getChildCommentsOfAComment(rootCommentId, userId, postId, maxDepthIncrease);
  return buildTree(flatComments, rootCommentId);
};
