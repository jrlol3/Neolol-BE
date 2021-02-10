/* eslint-disable camelcase */
const db = require("../models");

const {
  achievement,
  comment,
  comment_report,
  comment_vote,
  post,
  post_favorite,
  post_report,
  post_repost_flag,
  post_tag,
  post_vote,
  tag,
  tag_ignored,
  user,
  user_achievement,
  user_ignored,
  user_stats,
} = db;


// This has all relations possible, but there are a lot of them commented out
// They are either not working, not tested or not necessary
module.exports.create = async function() {

  user.hasMany(user_achievement, { as: "achievements", foreignKey: "user_fk", otherKey: "user_fk" });
  user_achievement.belongsTo(achievement, { as: "info", foreignKey: "achievement_fk", otherKey: "achievement_id" });

  // This works but kind of makes a loop, and isn't necessary for now
  // user_achievement.belongsTo(user, { foreignKey: 'user_fk' });
  // user_achievement.belongsTo(achievement, { foreignKey: 'post_fk' });

  user.hasOne(user_stats, { as: "stats", foreignKey: "user_fk" });
  // Works fine, but not necessary
  // user_stats.belongsTo(user, {foreignKey: 'user_fk'});

  user.hasMany(post, { as: "posts", foreignKey: "user_fk" });
  post.belongsTo(user, { foreignKey: "user_fk" });

  // Might not work properly
  user.belongsToMany(post_favorite, { as: "favorites", through: post_favorite, foreignKey: "user_fk", otherKey: "user_fk" });
  // post.hasMany(post_favorite);
  // post_favorite.belongsTo(user);
  // post_favorite.belongsTo(post);

  user.hasMany(comment, { as: "comments", foreignKey: "user_fk" });
  post.hasMany(comment, { as: "comments", foreignKey: "post_fk" });
  comment.belongsTo(user, { foreignKey: "user_fk" });
  comment.belongsTo(post, { foreignKey: "post_fk" });

  // Votes are the only relations I am sure that are working fine. Maybe.
  user.hasMany(post_vote, { foreignKey: "user_fk" });
  post.hasOne(post_vote, { as: "vote", foreignKey: "post_fk" });
  // post_vote.belongsTo(user, { foreignKey: 'user_fk' });
  // post_vote.belongsTo(post, { foreignKey: 'post_fk' });

  user.hasMany(comment_vote, { foreignKey: "user_fk" });
  // If it doesn't have an alias, it breaks for some reason
  comment.hasOne(comment_vote, { as: "vote", foreignKey: "comment_fk" });
  // comment_vote.belongsTo(user, { foreignKey: 'user_fk' });
  // comment_vote.belongsTo(comment, { foreignKey: 'comment_fk' });

  // We can see the reports in a post or the reports made by a user
  user.belongsToMany(post_report, { as: "post_reports", through: post_report, foreignKey: "user_fk", otherKey: "user_fk" });
  post.belongsToMany(post_report, { as: "post_reports", through: post_report, foreignKey: "post_fk", otherKey: "post_fk" });
  // post_report.belongsTo(user);
  // post_report.belongsTo(post);

  user.belongsToMany(comment_report, { as: "comment_reports", through: comment_report, foreignKey: "user_fk", otherKey: "user_fk" });
  comment.belongsToMany(comment_report, { as: "comment_reports", through: comment_report, foreignKey: "comment_fk", otherKey: "comment_fk" });
  // comment_report.belongsTo(user);
  // comment_report.belongsTo(post);

  user.belongsToMany(post_repost_flag, { as: "repost_flags", through: post_repost_flag, foreignKey: "user_fk", otherKey: "user_fk" });
  post.belongsToMany(post_repost_flag, { as: "repost_flags", through: post_repost_flag, foreignKey: "post_fk", otherKey: "post_fk" });
  // post_repost_flag.belongsTo(user);
  // post_repost_flag.belongsTo(post);
  // post_repost_flag.belongsTo(post);

  user.hasMany(user_ignored, { as: "ignored_users", foreignKey: "user_fk" });
  // This would mean that the ignored user would be able to see who ignores him
  // user_ignored.belongsTo(user);

  user.hasMany(tag_ignored, { as: "ignored_tags", foreignKey: "user_fk" });
  // tag.hasMany(tag_ignored);
  // tag_ignored.belongsTo(user);
  // tag_ignored.belongsTo(tag);

  // I am not sure if this is working right
  post.belongsTo(post, { as: "repost_of", foreignKey: "repost_fk", other_key: "post_fk" });
  // post.belongsTo(post);

  post.belongsToMany(tag, { through: post_tag, foreignKey: "post_fk", otherKey: "tag_fk" });
  // Not sure if this works because it creates a loop on swagger
  // tag.belongsToMany(post, { through: post_tag, foreignKey: 'tag_fk', otherKey: 'tag_fk' });
  // post_tag.belongsTo(post);
  // post_tag.belongsTo(tag);

  comment.hasMany(comment, { as: "reply", foreignKey: "parent_fk" });
  comment.belongsTo(comment, { as: "parent", foreignKey: "parent_fk" });
};
