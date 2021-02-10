const encryptionService = require("../services/encryptionService");
const accessTokenService = require("../services/accessTokenService");
const { cookieConfig, cookieConfigReset } = require("../config/cookies");
const { code, msg } = require("../constants");
const model = require("../models").user;

// Block methods not in the list
const methodWhitelist = [
  "GET",
];

// Allow even if the method is blocked
const routeWhitelist = [
  "/auth",
  "/register",
];

// Block even if the method is an exception
const routeBlacklist = [
  "/me",
];

exports.checkTokens = function(req, res, next) {
  // Token is the user's credentials
  // Access Token is the temporary access to the user
  const { token } = req.cookies;
  const accessToken = req.cookies.access_token;

  function CheckIfAuthNecessary() {
    if (!routeWhitelist.includes(req.url.toLowerCase()) ||
        routeBlacklist.includes(req.url.toLowerCase())) {
      if (!methodWhitelist.includes(req.method)) {
        return res.status(code.notAuthenticated).send(msg.notAuthenticated);
      }
    }
    return next();
  }

  function clearCookiesTokens() {
    res.cookie("access_token", "", cookieConfigReset);
    res.cookie("token", "", cookieConfigReset);
    req.verified = false;
    return CheckIfAuthNecessary();
  }

  async function writeTokensOnCookies(actoken) {
    res.cookie("access_token", actoken, cookieConfig);
    res.cookie("token", token, cookieConfig);
    const user = await accessTokenService.getUserDataByAccessToken(actoken);
    if (!user)
      return clearCookiesTokens();
    req.verified = user;
    return next();
  }

  // Checks if the Token is valid and makes a new Access Token
  function doCheck() {
    return accessTokenService.generateAccessTokenByRefreshToken(token).then(async (resp) => {
      if (!resp.error) {
        return writeTokensOnCookies(resp);
      }
      return clearCookiesTokens();
    }).catch(clearCookiesTokens);
  }

  // User is not verified if there are no tokens
  if (!token) {
    if (!accessToken) {
      req.verified = false;
      return CheckIfAuthNecessary();
    }
    return clearCookiesTokens();
  }

  // If there is no access token, verify and make one
  if (!accessToken && token) {
    return doCheck();
  }

  // If there are both, they have to be verified
  if (accessToken && token) {
    return encryptionService.verifySession(accessToken).then((verified) => {
      if (verified.error) {
        // Invalid access token, try to make a new one
        return doCheck();
      }
      model.findOne({ where: { username: verified.username, user_id: verified.user_id } }).then(async (result) => {
        if (!result) {
          // User not found, weird tokens
          return clearCookiesTokens();
        }
        // All is fine
        req.verified = result;
        return next();
      }).catch(clearCookiesTokens);
    }).catch(err => {
      if (err.name === "TokenExpiredError") {
        return doCheck();
      }
      return clearCookiesTokens();
    });
  }
};
