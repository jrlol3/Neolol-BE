const db = require("../models");
const encryptionService = require("./encryptionService");
const { msg, code } = require("../constants");

const model = db.user;


exports.generateAccessTokenByRefreshToken = async function(token) {
  try {
    const user = await model.findOne({ where: { token } });
    if (!user)
      return { status: code.invalidRefreshToken, error: msg.invalidRefreshToken.message };

    const payload = {
      username: user.username,
      user_id: user.user_id,
      email: user.email,
      avatar: user.avatar,
    };
    return await encryptionService.generateSessionToken(payload);
  }
  catch(err) {
    return { status: code.badRequest, error: err.message };
  };
};


exports.getUserDataByAccessToken = async function(accessToken) {
  try {
    const legit = await encryptionService.verifyToken(null, accessToken);
    return await model.findOne({ where: { user_id: legit.user_id } });
  }
  catch(err) {
    // This is a weird place to get an error and would be hard to debug
    if (process.env.DB_LOGGING === "console.log")
      console.log(err.message);
    return false;
  }
};
