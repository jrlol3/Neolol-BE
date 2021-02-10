/* eslint-disable no-await-in-loop */

const fs = require("fs");
const db = require("../models");


async function populate(model, file) {
  console.log(`Reading ${file}`);
  const sampleData = JSON.parse(fs.readFileSync(`./app/database/samples/${file}.json`)).data;
  for (let i = 0; i < sampleData.length; i += 1) {
    await model.findOrCreate({ where: sampleData[i], logging: false }).spread(function(userResult, created) {
      if (created) {
        return true;
      }
    });
  }
  console.log(`Inserted ${file} on ${model.name}`);
}


async function read() {
  await populate(db.user, "usersSample");
  await populate(db.post, "postsSample");
  await populate(db.comment, "commentsSample");
  await populate(db.achievement, "achievementsSample");
  await populate(db.user_achievement, "userAchievementsSample");
  await populate(db.user_stats, "userStatsSample");
  await populate(db.post_vote, "postVotesSample");
}

module.exports.read = read;
