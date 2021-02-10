const scoreService = require("../../services/scoreService");

module.exports = function(sequelize, DataTypes) {
  const voteModel = sequelize.define("post_vote", {
    user_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: "user",
        key: "user_id",
      },
    },
    post_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: "post",
        key: "post_id",
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
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: "post_vote",
    timestamps: true,
    sequelize,
    validate: {
      isBooleanVote(next) {
        if (this.upvote && this.downvote) {
          return next({ error: "INVALID_VOTE" });
        }
        return next();
      },
    },
    hooks: {
      async afterCreate(postVote) {
        let up = 0;
        let down = 0;
        let score = 0;
        if (postVote.upvote) {
          up = 1;
          score = 1;
        }
        if (postVote.downvote) {
          down = 1;
          score = -1;
        }
        if (score) {
          scoreService.updatePostScore(postVote.post_fk, score, up, down, sequelize);
        }
      },

      async afterUpdate(postVote) {
        const newUp = postVote.upvote;
        const newDown = postVote.downvote;
        const oldUp = (postVote.previous().upvote === true);
        const oldDown = (postVote.previous().downvote === true);

        const change = scoreService.getScoreChange(oldUp, oldDown, newUp, newDown);
        if (change) {
          const { score, up, down } = change;
          scoreService.updatePostScore(postVote.post_fk, score, up, down, sequelize);
        }
      },
    },
  });
  return voteModel;
};
