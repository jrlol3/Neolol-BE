module.exports = function (sequelize, DataTypes) {
  return sequelize.define("history_post_vote", {
    history_post_vote_id: {
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
    post_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: "post",
        key: "post_id",
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
    tableName: "history_post_vote",
  });
};
