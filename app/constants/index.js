const message = require("./messageConstants");
const provenances = require("./provenancesConstants");
const posts = require("./postConstants");
const comments = require("./commentConstants");
const misc = require("./miscConstants");

module.exports = {
  ...misc,
  ...posts,
  ...comments,
  ...message,
  provenances,
};
