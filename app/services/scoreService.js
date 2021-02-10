const { DAY } = require("../constants");

async function updateContentScore(contentId, addScore, upvote, downvote, contentTable) {
  try {
    const content = await contentTable.findByPk(contentId);
    content.score += addScore;
    content.upvotes += upvote;
    content.downvotes += downvote;

    if (+content.time_posted + DAY >= Date.now()) {
      content.score_at_24h = content.score;
    }

    await content.save();
  } catch (err) {
    console.log(`Error while retrieving ${contentTable.name} ${contentId}, couldn't update score (+${addScore}). Error details : ${err}`);
    return null;
  }
}


async function updatePostScore(postId, addScore, upvote, downvote, sequelize) {
  updateContentScore(postId, addScore, upvote, downvote, sequelize.models.post);
}

async function updateCommentScore(commentId, addScore, upvote, downvote, sequelize) {
  updateContentScore(commentId, addScore, upvote, downvote, sequelize.models.comment);
}


function getScoreChange(oldUpvote, oldDownvote, newUpvote, newDownvote) {
  // No change
  if (newUpvote === oldUpvote && newDownvote === oldDownvote)
    return null;
  if (newUpvote) {
    // Upvoting after a downvote
    if (oldDownvote) return { score: 2, up: 1, down: -1 };
    // Upvoting when no vote
    return { score: 1, up: 1, down: 0 };
  }
  if (newDownvote) {
    // Downvoting after upvote
    if (oldUpvote) return { score: -2, up: -1, down: 1 };
    // Downvoting when no vote
    return { score: -1, up: 0, down: 1 };
  }
  if (!newUpvote && !newDownvote) {
    // Removing the upvote
    if (oldUpvote) return { score: -1, up: -1, down: 0 };
    // Removing the downvote
    if (oldDownvote) return { score: 1, up: 0, down: -1 };
  }
  throw new Error ("Unexpected scenario occured");
}


exports.getScoreChange = getScoreChange;
exports.updatePostScore = updatePostScore;
exports.updateCommentScore = updateCommentScore;
