/* eslint-disable no-await-in-loop */

const { QueryTypes } = require("sequelize");
const fs = require("fs");
const db = require("../models");

const eventsList = [
  {
    fileName: "karmaAttributorEvent",
    eventName: "karma_attributor_event",
  },
];


async function create() {
  for (let i = 0; i < eventsList.length; i += 1) {
    const eventSql = fs.readFileSync(`./app/database/queries/${eventsList[i].fileName}.sql`, "utf8").toString();
    await db.sequelize.query(eventSql, {
      logging: false,
      plain: true,
      raw: true,
      type: QueryTypes.RAW,
    });
  }
}


async function drop() {
  for (let i = 0; i < eventsList.length; i += 1) {
    await db.sequelize.query(`DROP EVENT IF EXISTS ${eventsList[i].eventName}`, {
      logging: false,
      plain: true,
      raw: true,
      type: QueryTypes.RAW,
    });
  }
}


module.exports.create = create;
module.exports.drop = drop;