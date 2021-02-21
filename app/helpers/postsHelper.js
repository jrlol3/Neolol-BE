const { Op } = require("sequelize");
const includes = require("./includeHelper");
const { provenances, HOUR, MAX_POST_RETRIEVE } = require("../constants");


const where = {
  PROFILE: {
    deleted: false,
  },
  NOT_HIDDEN: {
    repost_fk: { [Op.eq]: null },
    score: { [Op.gt]: -10 },
    deleted: false,
  },
  FRONT: {
    time_front: { [Op.ne]: null },
  },
  RISING: {
    time_rising: { [Op.ne]: null },
  },
  // Do we need some filter?
  FRESH: {},
};


function after(post, provenance) {
  const result = {};
  if (post == null) {
    return result;
  }

  const postValues = post.dataValues;

  // If you try to get posts after X on Front
  // But X is not on Front yet
  const time = provenances[provenance].time || provenances.DEFAULT.time;
  if (postValues[time] == null) {
    return result;
  }

  // Time has to be lower than
  // Else it includes the post too
  result[time] = { [Op.lte]: postValues[time] };
  result.post_id = { [Op.ne]: postValues.post_id };
  return result;
}


function preferences(prefs) {
  // Default preferences
  const result = {
    mature_content: false,
  };
  if (!prefs)
    return result;

  // Since it's disabled by default, it's removed
  if (prefs.show_mature)
    delete result.mature_content;

  return result;
}


function hideScoreIfNew(post, userId) {
  // Does not hide from the owner of the post
  if (userId === post.user_fk)
    return post;
  // If post is newer than 1 hour
  if (+post.time_posted + HOUR > Date.now()) {
    post.setDataValue("score", false);
    post.setDataValue("score_at_24h", false);
    post.setDataValue("upvotes", false);
    post.setDataValue("downvotes", false);
  }
  return post;
}

// Can be used later to unify post treatment
function treatPost(post, user) {
  if (!post) return post;
  if (post.deleted != null) delete post.dataValues.deleted;
  const userId = user && user.user_id;
  return hideScoreIfNew(post, userId);
};

// Can hide ignored posts later
function treatPosts(posts, user) {
  if (!posts) return posts;
  for (let i = 0; i < posts.length; i += 1) {
    posts[i] = treatPost(posts[i], user);
  }
  return posts;
}


function postsOnProfile(userId, prefs, offset=0) {
  return {
    limit: MAX_POST_RETRIEVE,
    offset, // Serves as pagination
    attributes: {
      exclude: ["deleted"],
    },
    ...includes.withoutNulls([
      includes.includeUserPostVote(userId),
      includes.userOnProvenance(),
    ]),
    where: {
      ...where.PROFILE,
      ...preferences(prefs),
    },
    order: [
      ["time_posted", "DESC"],
      ["post_id", "DESC"],
    ],
  };
}


function postsOnProvenance(userId, prefs, provenance, post) {
  return {
    where: {
      ...where.NOT_HIDDEN,
      ...where[provenance] || {},
      ...after(post, provenance),
      ...preferences(prefs),
    },
    order: provenances[provenance].order || provenances.DEFAULT.order,
    limit: MAX_POST_RETRIEVE,
    attributes: {
      exclude: ["deleted"],
    },
    ...includes.withoutNulls([
      includes.includeUserPostVote(userId),
      includes.userOnProvenance(),
    ]),
  };
};


function postAlone(userId, postId) {
  return {
    where: {
      post_id: postId,
      deleted: false,
    },
    attributes: {
      exclude: ["deleted"],
    },
    ...includes.withoutNulls([
      includes.includeUserPostVote(userId).include,
      includes.userOnPost(),
    ]),
  };
}

exports.treatPost = treatPost;
exports.treatPosts = treatPosts;
exports.postsOnProfile = postsOnProfile;
exports.postsOnProvenance = postsOnProvenance;
exports.postAlone = postAlone;
