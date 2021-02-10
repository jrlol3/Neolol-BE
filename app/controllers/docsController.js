const fs = require("fs");
const path = require("path");

exports.getDocs = function(req, res) {
  const apiFile = path.join(`${__dirname}`, "../swagger/docs/", "api.yml");
  if (fs.existsSync(apiFile)) {
    return res.sendFile(apiFile);
  }
  return res.send({});
};
