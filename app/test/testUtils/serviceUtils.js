const tokenService = require("../../services/accessTokenService");

exports.getUserTokenAndAccessTokenCookies = async (userModelInstance) => {
  const token = userModelInstance.getDataValue("token");
  const accessToken = await tokenService.generateAccessTokenByRefreshToken(token);
  return `token=${token};access_token=${accessToken}`;
};
