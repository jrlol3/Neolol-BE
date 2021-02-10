const db = require("../models");
const userService = require("./userService");
const { DAY, provenances } = require("../constants");

const { FRONT, RISING } = provenances;

const Op = db.operators;

exports.getSameIpOtherUser = async function(model, userId, ip, contentId, contentFkName) {
  try {
    return await model.findOne({
      where: {
        user_fk: { [Op.ne]: userId },
        [contentFkName]: contentId,
        ip,
      },
    });
  } catch (err) {
    return { error: err.message };
  }
};


async function moveRising(post) {
  if (post[RISING.time] == null && post.score >= RISING.score) {
    return Date.now();
  }
  return post[RISING.time];
}

async function moveFront(post) {
  if (post[FRONT.time] == null && post.score >= FRONT.score) {
    await userService.increaseFrontStat(post.user_fk);
    if (post.original_content)
      await userService.increaseOriginalFrontStat(post.user_fk);
    return Date.now();
  }
  return post[FRONT.time];
}


exports.getAndUpdate24h = async function(contentModel, contentId, parentPostId) {
  try {
    const content = await contentModel.findByPk(contentId);
    if (content.deleted === true)
      return null;

    // Checks if the comment's post Id is right
    if (parentPostId != null && contentModel === db.comment) {
      if (content.parent_fk !== parentPostId)
        return false;
    }

    // Checks if the post is less than a day old
    if (+content.time_posted + DAY >= Date.now()) {
      if (contentModel === db.post) {
        content[RISING.time] = await moveRising(content);
        content[FRONT.time] = await moveFront(content);
      }

      await content.save();
      return true;
    }

    return false;
  }
  catch(err) {
    return { error: err };
  }
};


exports.updateExistingVote = async function(type, userId, vote, ip, contentId) {
  try {
    const upvote = (vote === 1);
    const downvote = (vote === 0);
    const existingVote = await type.model.findOne({
      where: {
        user_fk: userId,
        [type.fkName]: contentId,
      },
    });

    if (existingVote != null) {
      // Returns if there would be no vote change
      if ((existingVote.upvote === true) === upvote &&
          (existingVote.downvote === true) === downvote) {
        return true;
      }

      existingVote.upvote = upvote;
      existingVote.downvote = downvote;
      existingVote.ip = ip;

      // Updates the vote
      return await existingVote.save();
    }
  } catch (err) {
    return { error: err.message };
  }
};


exports.newVote = async function newVote(type, userId, vote, ip, contentId) {
  try {
    const upvote = (vote === 1);
    const downvote = (vote === 0);
    return await type.model.create({
      user_fk: userId,
      [type.fkName]: contentId,
      ip,
      upvote,
      downvote,
    });
  }
  catch(err) {
    return { error: err.message };
  };
};
