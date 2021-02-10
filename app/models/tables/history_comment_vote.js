module.exports = function (sequelize, DataTypes) {
  return sequelize.define("history_comment_vote", {
    history_comment_vote_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    history_voting_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: "history_voting",
        key: "history_voting_id",
      },
    },
    comment_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: "comment",
        key: "comment_id",
      },
    },
    user_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: "user",
        key: "user_id",
      },
    },
    upvote: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    downvote: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
    },
    is_last_value: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
    rollbacked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
  }, {
    tableName: "history_comment_vote",
  });
};
