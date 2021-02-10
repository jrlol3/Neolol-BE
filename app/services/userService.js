const { ValidationError } = require("sequelize");
const db = require("../models");
const encryptionService = require("./encryptionService");
const includes = require("../helpers/includeHelper");
const postHelper = require("../helpers/postsHelper");

const model = db.user;
const statsModel = db.user_stats;
const sql = db.sequelize.Sequelize;


exports.newUser = async function(user) {
  const safeUser = await encryptionService.encrypt(user);
  if (safeUser.error != null)
    return null;

  try {
    return await model.sequelize.transaction(async (t) => {
      const created = await model.create(safeUser, { transaction: t });
      await statsModel.create({ user_fk: created.getDataValue("user_id") }, { transaction: t });
      return created;
    });
  }
  catch(error) {
    if (error instanceof ValidationError)
      return ({ error: error.errors[0].message });
    return { error: error.message };
  }
};


function unnestAchievements(user) {
  if (user == null)
    return null;
  const achievements = user.getDataValue("achievements") || [];
  for (let i = 0; i < achievements.length; i+=1) {
    const info = achievements[i].getDataValue("info").dataValues;
    delete achievements[i].dataValues.info;
    Object.keys(info).forEach(function(key) {
      achievements[i].setDataValue(key, info[key]);
    });
  }
  user.setDataValue("achievements", achievements);
  return user;
}

exports.getUser = async function(username, requesting_user) {
  try {
    let user = await model.findOne({
      where: sql.where(sql.fn("lower", sql.col("username")), username.toLowerCase()),
      ...includes.userOnProfile(requesting_user.user_id),
    });
    user = unnestAchievements(user);
    user.setDataValue("posts", postHelper.treatPosts(user.posts, requesting_user));
    return user;
  }
  catch(error) {
    return { error: error.message };
  }
};


exports.getUserSimple = async function(username) {
  if (!username)
    return null;
  try {
    return model.findOne({
      where: sql.where(sql.fn("lower", sql.col("username")), username.toLowerCase()),
      attributes: ["user_id", "username", "nickname", "about", "joined", "avatar"],
    });
  }
  catch(error) {
    return { error: error.message };
  }
};


// Needs better error treatment
exports.increaseFrontStat = async function(userId, originalContent) {
  try {
    const stats = await statsModel.findByPk(userId);
    stats.posts_on_front += 1;
    if (originalContent)
      stats.original_posts_on_front += 1;
    return await stats.save();
  }
  catch(err) {
    console.log("increaseFrontStat");
    console.log(err.message);
  }
};

exports.updateUserProfile = async (userId, nickname, about, showMature) => {
  return model.updateUserProfile(userId, nickname, about, showMature);
};
