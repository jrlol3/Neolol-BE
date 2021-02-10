const { ValidationError } = require("sequelize");
const { Op } = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const CommentModel = sequelize.define("comment", {
    comment_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: "user",
        key: "user_id",
      },
      // This field is commented because there should be no reason another user_id
      // would be used when creating a comment.
      // I would like to keep this here for a few version in case something unexpected happens
      // TODO remove this field in v0.3.0
      // validate: {
      //   async commenterUserExists(user_fk) {
      //     const post = await sequelize.models.user.findByPk(user_fk);
      //     if (!post) throw new ValidationError('The user that supposedly posted this comment does not exist' + user_fk)
      //   },
      // }
    },
    post_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: "post",
        key: "post_id",
      },
      validate: {
        async parentPostExists(post_fk) {
          const post = await sequelize.models.post.findByPk(post_fk);
          if (!post) throw new ValidationError(`The post this comment wants to be on does not exist; post_id: ${post_fk}`);
        },
      },
    },
    parent_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: "comment",
        key: "comment_id",
      },
    },
    thread_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: "comment",
        key: "comment_id",
      },
    },
    reply_depth: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0",
    },
    has_reply: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    score: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0",
    },
    score_at_24h: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0",
    },
    upvotes: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0",
    },
    downvotes: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0",
    },
    content: {
      type: DataTypes.TEXT,
      defaultValue: "",
      allowNull: {
        args: false,
        msg: "NO_CONTENT",
      },
      validate: {
        len: {
          args: [0, 4096],
          msg: ["TOO_LONG"],
        },
      },
    },
    has_attachment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
    attachment_extension: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    time_posted: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    edited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
  }, {
    tableName: "comment",
    sequelize,
    validate: {},
  });
  CommentModel.beforeCreate("addRepliesToParent", async (comment, options) => {
    if (comment.parent_fk) {
      const parentComment = await comment.getParent();
      if (!parentComment)
        throw new ValidationError(`Parent's comment_id does not exist: ${comment.parent_fk}`);
      // eslint-disable-next-line
      if (parentComment.dataValues.post_fk != comment.dataValues.post_fk)
        throw new ValidationError(`Parent comment is in another post: ${parentComment.post_fk} != ${comment.post_fk}`);
      // add metadata that reply-comments should have
      comment.reply_depth = parentComment.dataValues.reply_depth + 1;
      comment.thread_fk = parentComment.thread_fk || parentComment.comment_id;

      if (!parentComment.has_reply) {
        parentComment.has_reply = true;
        parentComment.save({
          fields: ["has_reply"],
          transaction: options.transaction,
        });
      }
    }
  });
  CommentModel.beforeCreate("addCommentToPost", async (comment, options) => {
    comment.sequelize.models.post.increment(
      "comment_count",
      { by: 1, where: { post_id: comment.post_fk } },
      { transaction: options.transaction },
    );
  });
  CommentModel.getCommentsFromAPost = async (postId, userId, maxDepth) => {
    const test = {
      where: {
        post_fk: postId,
        reply_depth: { [Op.lte]: maxDepth },
      },
      order: [["score", "DESC"], ["time_posted", "ASC"]],
      include: [{
        model: sequelize.models.comment_vote,
        as: "vote",
        where: { "$vote.user_fk$": userId },
        attributes: ["upvote", "downvote"],
        required: false,
      }, {
        model: sequelize.models.user,
        attributes: ["username",
          "nickname",
          "avatar",
          "is_mod",
          "is_admin"],
      }],
    };
    return CommentModel.findAll(test);
  };

  CommentModel.getChildCommentsOfAComment = async (rootCommentId, userId, maxDepthIncrease) => {
    const rootComment = await CommentModel.findByPk(rootCommentId);
    if (!rootComment.has_reply)
      return [rootComment];

    const test = {
      where: {
        [Op.or]: [
          { thread_fk: rootComment.thread_fk || rootCommentId },
          { comment_id: rootComment.thread_fk || rootCommentId },
        ],
        [Op.and]: [
          { reply_depth: { [Op.gte]: rootComment.reply_depth } },
          { reply_depth: { [Op.lte]: rootComment.reply_depth + maxDepthIncrease } },
        ],
      },
      order: [
        ["score", "DESC"],
        ["time_posted", "ASC"],
      ],
      include: [
        {
          model: sequelize.models.comment_vote,
          as: "vote",
          where: { "$vote.user_fk$": userId },
          attributes: ["upvote", "downvote"],
          required: false,
        }, {
          model: sequelize.models.user,
          attributes: ["username", "nickname", "avatar", "is_mod", "is_admin"],
        }],
    };
    return CommentModel.findAll(test);
  };

  CommentModel.softDeleteComment = async (postId, commentId) => {
    const commentToDelete = await CommentModel.findByPk(commentId);
    // Change this later?
    if (commentToDelete.getDataValue("post_fk") !== postId)
      throw new ValidationError("wrong post id");
    commentToDelete.deleted = 1;
    await commentToDelete.save({ fields: ["deleted"] });

    await commentToDelete.sequelize.models.post.increment(
      "comment_count",
      { by: -1, where: { post_id: commentToDelete.post_fk } },
    );
    return commentToDelete;
  };

  CommentModel.editCommentContent = async (commentId, content) => {
    const commentToEdit = await CommentModel.findByPk(commentId);
    if (commentToEdit.getDataValue("deleted") === true) {
      throw new ValidationError("cannot edit a deleted comment");
    }
    commentToEdit.content = content;
    return commentToEdit.save({ fields: ["content"] });
  };
  return CommentModel;
};
