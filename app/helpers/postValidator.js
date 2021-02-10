const { MB } = require("../constants");
const { msg, code } = require("../constants");
const { PostValidationError } = require("./validationError");

// eslint-disable-next-line no-unused-vars
function validateFileSize(size, _mimetype) {
  // returning false means validation failed
  return size < 5*MB;
}

function mimetypeIsValid(mimetype) {
  const validFirstPartsOfMimetype = ["image", "video"];
  const firstPartOfMimetype = mimetype.split("/")[0];
  return validFirstPartsOfMimetype.includes(firstPartOfMimetype);
}

exports.validatePostUpload = function(title, files) {
  const file = files.files;
  if (!file) {
    throw new PostValidationError({ message: msg.noFileUploaded, status: code.badRequest });
  }
  if (file instanceof Array) {
    throw new PostValidationError({ message: msg.multipleFilesUploaded, status: code.badRequest });
  }
  if (!mimetypeIsValid(file.mimetype)) {
    throw new PostValidationError({ message: msg.invalidMimeType, status: code.badRequest });
  }
  if (!validateFileSize(file.size, file.mimetype)) {
    throw new PostValidationError({ message: msg.fileTooLarge, status: code.badRequest });
  }
};
