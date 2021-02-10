const fs = require("fs");
const config = require("../config/config");
const db = require("../models");
const { getFileType } = require("../utils/fileUtils");
const helper = require("../helpers/postsHelper");

const postModel = db.post;

async function getPost(user, postId) {
  const userId = user && user.user_id;
  let post = await postModel.findOne(helper.postAlone(userId, postId));
  post = helper.treatPost(post, user);
  return post;
}


async function getPostsOnProfile(user, targetId, offset) {
  const userId = user && user.user_id;
  const prefs = user && { mature_content: user.mature_content };

  const query = helper.postsOnProfile(userId, prefs, offset);
  query.where.user_fk = targetId;

  const posts = await postModel.findAll(query);
  return helper.treatPosts(posts, user);
}


async function getAllPosts(user, provenance, after) {
  const post = await db.post.findByPk(after);

  const prefs = { mature_content: user.mature_content };
  // Call to get all posts
  const posts = await postModel.findAll({
    ...helper.postsOnProvenance(user.user_id, prefs, provenance, post),
  });
  return helper.treatPosts(posts, user);
}


async function createPostInDB(user, files, title, options) {
  // we can safely extract the object as it was already validated
  const post = files.files;
  const newPost = {
    user_fk: user.user_id,
    title,
    extension: await getFileType(post.data),
  };
  if (options) {
    Object.assign(newPost, {
      mature_content: options.mature_content,
      original_content: options.original_content,
    });
  }
  return db.post.sequelize.transaction(async (t) => {
    const created = await db.post.create(newPost, { transaction: t });
    // here apply side effects
    return created;
  });
}


async function savePostToDisk (postFile, postRow) {
  const stream = fs.createWriteStream(`${config.cdnPath}/post/${postRow.dataValues.post_id}.${postRow.extension}`);
  stream.once("open", async () => {
    try {
      stream.write(postFile.data);
      stream.end();
      stream.close();
    } catch (e) {
      stream.close();
      throw e;
    }
  });
}

exports.deletePost = (postId) => {
  return postModel.deletePost(postId);
};

exports.editPostTitle = async (commentId, newTitle) => {
  return postModel.editPostTitle(commentId, newTitle);
};

exports.getPost = getPost;
exports.getPostsOnProfile = getPostsOnProfile;
exports.getAllPosts = getAllPosts;
exports.createPostInDB = createPostInDB;
exports.savePostToDisk = savePostToDisk;
