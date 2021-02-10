const { ValidationError } = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const PostModel = sequelize.define("post", {
    post_id: {
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
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        max: {
          args: [128],
          msg: "TOO_LONG",
        },
      },
    },
    extension: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time_posted: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    time_rising: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    time_front: {
      type: DataTypes.DATE(3),
      allowNull: true,
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
    comment_count: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0",
    },
    mature_content: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
    original_content: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
    repost_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: "post",
        key: "post_id",
      },
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
  }, {
    tableName: "post",
    sequelize,
    validate: {},
  });
  PostModel.deletePost = async (postId) => {
    const postToDelete = await PostModel.findByPk(postId);
    postToDelete.deleted = 1;
    return postToDelete.save({ fields: ["deleted"] });
  };
  PostModel.editPostTitle = async (postId, title) => {
    const postToEdit = await PostModel.findByPk(postId);
    if (postToEdit.getDataValue("deleted") === true) {
      throw new ValidationError("cannot change the title of a deleted post");
    }
    postToEdit.title = title;
    return postToEdit.save({ fields: ["title"] });
  };
  return PostModel;
};
