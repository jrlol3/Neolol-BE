const fileType = require("file-type");

exports.getFileType = async function (buffer) {
  const result = await fileType.fromBuffer(buffer);
  return result.ext;
};
