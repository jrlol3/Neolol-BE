const db = require("../models");
const postsHelper = require("./postsHelper");
const { MAX_COMMENT_RETRIEVE_ON_PROFILE } = require("../constants");

function withoutNulls(relations) {
  const includes = [];
  relations.forEach(relation => {
    // {} == {} = false, because Javascript
    if (relation && Object.keys(relation).length)
      if (relation.include)
        includes.push(relation.include);
      else
        includes.push(relation);
  });
  return { include: includes };
};


function includeUserPostVote(userId) {
  if (userId == null) return {};
  return {
    include: {
      model: db.post_vote,
      as: "vote",
      where: {
        "$vote.user_fk$": userId,
      },
      attributes: [
        "upvote",
        "downvote",
      ],
      required: false,
    },
  };
}


const commentsOnPost = {
  model: db.comment,
  as: "comments",
  required: false,
  where: {
    deleted: false,
  },
  order: [
    ["comments", "score", "DESC"],
    ["comments", "time_posted", "ASC"],
  ],
};


function includeUserCommentVote(userId, prefix = "") {
  if (userId == null) return {};
  return {
    include: {
      model: db.comment_vote,
      as: "vote",
      where: {
        [`$${prefix}vote.user_fk$`]: userId,
      },
      attributes: [
        "upvote",
        "downvote",
      ],
      required: false,
    },
  };
}


function commentsWithUserVote(userId) {
  const result = commentsOnPost;
  if (userId == null) return result;
  return { ...result, ...includeUserCommentVote(userId, "comments.") };
}


function achievementInfo(alias) {
  const include = {
    model: db.achievement,
    attributes: [
      "name",
      "description",
      "rank",
      "type",
    ],
  };
  if (alias != null)
    include.as = alias;
  return include;
}


const userOnContent = {
  model: db.user,
  attributes: [
    "username",
    "nickname",
    "avatar",
    "is_mod",
    "is_admin",
  ],
};


function userOnPost() {
  // Has to do it like this so it creates a clone
  const poster = { ...userOnContent };
  poster.attributes = [...poster.attributes, ...[
    "about",
    // 'showcased_achievement'
  ]];
  return poster;
}

function userOnProvenance() {
  const poster = userOnContent;
  return poster;
}

function userOnComment() {
  const poster = userOnContent;
  // poster.attributes = [...poster.attributes, ...[
  // 'showcased_achievement'
  // ]]
  return poster;
}


function userOnProfile(userId) {
  return {
    attributes: [
      "username",
      "nickname",
      "avatar",
      "is_mod",
      "is_admin",
      "about",
      "joined",
      "public_comments",
      "public_upvotes",
      "public_downvotes",
      "user_id",
    ],
    include: [
      {
        model: db.user_stats,
        as: "stats",
        attributes: [
          "karma",
          "upvotes",
          "downvotes",
          "posts",
          "comments",
          "posts_on_front",
        ],
      },
      {
        model: db.user_achievement,
        as: "achievements",
        attributes: [
          "time",
          "link",
        ],
        include: {
          ...achievementInfo("info"),
          required: true,
        },
      },
      {
        model: db.post,
        as: "posts",
        ...postsHelper.postsOnProfile(userId),
      },
      {
        model: db.comment,
        as: "comments",
        limit: MAX_COMMENT_RETRIEVE_ON_PROFILE,
        ...withoutNulls([
          includeUserCommentVote(userId),
          userOnComment(),
        ]),
        order: [
          ["comment_id", "DESC"],
        ],
      },
    ],
    order: [
      ["achievements", "info", "rank", "DESC"],
      ["achievements", "info", "name", "ASC"],
      ["achievements", "time", "DESC"],
    ],
  };
}


module.exports.withoutNulls = withoutNulls;
module.exports.includeUserPostVote = includeUserPostVote;
module.exports.commentsOnPost = commentsOnPost;
module.exports.includeUserCommentVote = includeUserCommentVote;
module.exports.commentsWithUserVote = commentsWithUserVote;
module.exports.userOnPost = userOnPost;
module.exports.userOnProvenance = userOnProvenance;
module.exports.userOnComment = userOnComment;
module.exports.userOnProfile = userOnProfile;
