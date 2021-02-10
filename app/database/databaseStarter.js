const fs = require("fs");
const db = require("../models");
const relations = require("./relationsLoader");
const events = require("./eventsLoader");
const samples = require("./samplesLoader");
const docsMaker = require("../swagger/swaggerMaker");
const config = require("../config/config");

module.exports = async function startDatabase(testArguments) {
  try {
    // This checks for arguments given while starting the server for debugging
    const dropAll = testArguments.includes("--drop");
    const createDatabase = !testArguments.includes("--dontcreate");
    const populateWithSamples = testArguments.includes("--sample");
    const createDebugDownloadFolders = testArguments.includes("--debugdownload");

    if (dropAll) {
      process.stdout.write("Dropping all tables: ");
      try {
        await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
        await db.sequelize.dropAllSchemas({ logging: false });
        await events.drop();
      }
      catch (e) {
        console.log(e); 
      }
      finally {
        await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
      }
      console.log("OK");
    }

    if (createDatabase) {
      process.stdout.write("Creating Database: ");
      await db.sequelize.sync({ logging: false });
      await relations.create();
      await events.create();
      console.log("OK");
    }

    if (createDebugDownloadFolders) {
      process.stdout.write("Creating Download Folders: ");
      if (!fs.existsSync(`${config.cdnPath}`)) {
        fs.mkdirSync(`${config.cdnPath}`);
        fs.mkdirSync(`${config.cdnPath}/post`);
      } else if (!fs.existsSync(`${config.cdnPath}/post`)) {
        fs.mkdirSync(`${config.cdnPath}/post`);
      }
      console.log("OK");
    }

    process.stdout.write("Creating API Docs: ");
    docsMaker.save();
    console.log("OK");

    if (populateWithSamples) {
      await samples.read();
    }
  } catch (err) {
    console.log(err);
  }
};
