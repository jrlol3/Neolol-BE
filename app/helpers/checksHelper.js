exports.isMissingData = function(data) {
  for (let i = 0; i < data.length; i += 1) {
    if (data[i] == null) {
      return true;
    }
  }
  return false;
};


exports.isNumber = function(str) {
  const pattern = /^\d+$/;
  return pattern.test(str);  // returns a boolean
};

exports.validateTitle = function(title) {
  if (!title) {
    return { message: "No title given", status: false };
  }
  if (title.length < 6) { // change length to whatever you want
    return { message: "Title too short", status: false };
  }
  if (title.length > 64) {
    return { message: "Title too long", status: false };
  }
  return { status: true };
};
