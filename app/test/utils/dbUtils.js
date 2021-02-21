const { users, posts, comments } = require("../data");

let db;
exports.init = (sql) => {
  db = sql;
  return this;
};

exports.add = async (model, data) => {
  return model.create(data);
};

exports.addUser = async (data) => {
  return db.user.create(data);
};

exports.addBasicUser = async () => {
  return db.user.create(users.makeBasicUser());
};

exports.addAllUsers = async () => {
  await users.getAll().forEach(async (user) => {
    await db.user.create(user);
  });
};

exports.addPost = async (data) => {
  return db.post.create(data);
};

exports.addBasicPost = async () => {
  return db.post.create(posts.makeBasicPost());
};

exports.addAllPosts = async () => {
  await this.addUser(users.makeAdminUser());
  await this.addUser(users.makeModUser());
  await posts.getAll().forEach(async (post) => {
    await db.post.create(post);
  });
};

exports.addComment = async (data) => {
  return db.comment.create(data);
};

exports.addBasicComment = () => {
  return db.comment.create(comments.makeBasicComment());
};

exports.addChildComment = (id) => {
  return db.comment.create(comments.makeReply(id));
};

exports.addAllComments = async () => {
  /**
   * Add a couple of users, a couple of posts, and comments for them
   * Also, this function makes tests flaky
   */
  await this.addUser(users.makeAdminUser());
  await this.addUser(users.makeModUser());
  await this.addBasicPost();
  await this.addBasicPost();
  await comments.getAll().forEach(async (comment) => {
    await db.comment.create(comment);
  });
};

exports.addNestedComments = async () => {
  const testComments = comments.getRepliesOnASinglePost();
  for (let i=0; i<testComments.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await db.comment.create(testComments[i]);
  }
};

exports.addPostVote = async (data) => {
  return db.post_vote.create(data);
};

exports.getDbData = (whereQuery) => {
  return db.comment.findAll({
    where: whereQuery,
  });
};

exports.getAllPostsFromDB = () => {
  return db.post.findAll({ where: {} });
};
