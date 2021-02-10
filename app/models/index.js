const fs = require("fs");
const path = require("path");
const { Sequelize, Op } = require("sequelize");

const basename = path.basename(__filename);
const config = require("../config/config");

const sql = new Sequelize(config.database, config.username, config.password, config);
const db = {
  sequelize: sql,
  operators: Op,

  achievement: sql.import("./tables/achievement"),
  comment_report: sql.import("./tables/comment_report"),
  comment_vote: sql.import("./tables/comment_vote"),
  comment: sql.import("./tables/comment"),
  history_comment_vote: sql.import("./tables/history_comment_vote"),
  history_post_vote: sql.import("./tables/history_post_vote"),
  history_voting: sql.import("./tables/history_voting"),
  log: sql.import("./tables/log"),
  post_favorite: sql.import("./tables/post_favorite"),
  post_report: sql.import("./tables/post_report"),
  post_repost_flag: sql.import("./tables/post_repost_flag"),
  post_tag: sql.import("./tables/post_tag"),
  post_vote: sql.import("./tables/post_vote"),
  post: sql.import("./tables/post"),
  tag_ignored: sql.import("./tables/tag_ignored"),
  tag: sql.import("./tables/tag"),
  user_achievement: sql.import("./tables/user_achievement"),
  user_ignored: sql.import("./tables/user_ignored"),
  user_stats: sql.import("./tables/user_stats"),
  user: sql.import("./tables/user"),
};


fs.readdirSync(`${__dirname}/tables/`)
  .filter(file => {
    return (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-3) === ".js");
  })
  .forEach(file => {
    const model = sql.import(path.join(`${__dirname}/tables/`, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


db.sequelize = sql;
db.Sequelize = Sequelize;

module.exports = db;