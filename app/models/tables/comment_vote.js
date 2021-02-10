const scoreService = require("../../services/scoreService");

module.exports = function(sequelize, DataTypes) {
  const voteModel = sequelize.define("comment_vote", {
    user_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: "user",
        key: "user_id",
      },
    },
    comment_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: "comment",
        key: "comment_id",
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
    tableName: "comment_vote",
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
      async afterCreate(commentVote) {
        let up = 0;
        let down = 0;
        let score = 0;
        if (commentVote.upvote) {
          up = 1;
          score = 1;
        }
        if (commentVote.downvote) {
          down = 1;
          score = -1;
        }
        if (score) {
          scoreService.updateCommentScore(commentVote.comment_fk, score, up, down, sequelize);
        }
      },

      async afterUpdate(commentVote) {
        const newUp = commentVote.upvote;
        const newDown = commentVote.downvote;
        const oldUp = (commentVote.previous().upvote === true);
        const oldDown = (commentVote.previous().downvote === true);

        const change = scoreService.getScoreChange(oldUp, oldDown, newUp, newDown);
        if (change) {
          const { score, up, down } = change;
          scoreService.updateCommentScore(commentVote.comment_fk, score, up, down, sequelize);
        }
      },
    },
  });
  return voteModel;
};
