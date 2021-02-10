module.exports = function(sequelize, DataTypes) {
  return sequelize.define("user_stats", {
    user_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: "user",
        key: "user_id",
      },
    },
    karma: {
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
    posts: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0",
    },
    comments: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0",
    },
    posts_on_front: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0",
    },
    original_posts_on_front: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0",
    },
  }, {
    tableName: "user_stats",
  });
};
