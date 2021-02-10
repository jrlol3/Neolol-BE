const testData = require("./testData");

exports.addUser = async (db) => {
  return db.user.create(testData.basicUser);
};

exports.addPost = async (db) => {
  return db.post.create(testData.basicPost);
};

exports.addParentComment = (db) => {
  return db.comment.create(testData.basicComment);
};

exports.addChildComment = (db) => {
  return db.comment.create(testData.childComment);
};

exports.getDbData = (db, whereQuery) => {
  return db.comment.findAll({
    where: whereQuery });
};