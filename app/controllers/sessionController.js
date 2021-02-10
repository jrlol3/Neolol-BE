const sessionService = require("../services/sessionService");
const encryptionService = require("../services/encryptionService");
const check = require("../helpers/checksHelper");
const { msg, code } = require("../constants");
const { cookieConfig, cookieConfigReset } = require("../config/cookies");


exports.authenticate = async function(req, res) {
  // If there are verified tokens already, should not login
  if (req.verified)
    return res.status(code.alreadySignedIn).send(msg.alreadySignedIn);

  const auth = req.body;
  if (check.isMissingData([auth.identification, auth.password]))
    return res.status(code.missingData).send(msg.missingData);
  auth.identification = auth.identification.toLowerCase();

  const user = await sessionService.authenticate(auth);
  if (user.error != null)
    return res.status(user.status).send({ error: user.error });

  // Credentials are valid, create the Access Token
  const { username, user_id: userId, email, avatar, token } = user;
  const accessToken = await encryptionService.generateSessionToken({ username, user_id: userId, email, avatar });
  if (accessToken == null)
    return res.status(code.badRequest).send({ error: "Encryption problem" });
  if (accessToken.error != null)
    return res.status(code.badRequest).send({ error: accessToken.error });

  // Write the tokens and return success
  res.cookie("access_token", accessToken, cookieConfig);
  res.cookie("token", token, cookieConfig);
  return res.status(code.success).send(msg.success);
};


exports.logout = function(req, res) {
  res.cookie("access_token", "", cookieConfigReset);
  res.cookie("token", "", cookieConfigReset);
  res.status(code.signedOut).send(msg.signedOut);
};
