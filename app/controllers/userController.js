const { validationResult } = require("express-validator");
const GoogleRecaptcha = require("google-recaptcha");
const { updateUserProfile } = require("../services/userService");

const { UserValidationError } = require("../helpers/validationError");
const db = require("../models");
const service = require("../services/userService");
const accessTokenService = require("../services/accessTokenService");
const { cookieConfig, cookieConfigReset } = require("../config/cookies");
const { debugKey } = require("../config/config");
const check = require("../helpers/checksHelper");
const { msg, code } = require("../constants");

const model = db.user;

exports.create = async function(req, res) {
  if (req.verified)
    return res.status(code.alreadySignedIn).send(msg.alreadySignedIn);

  const sessionCookie = req.cookies.access_token;
  if (sessionCookie) {
    // If the user is not verified but has a token, reset it
    res.cookie("access_token", "", cookieConfigReset);
  }

  const { bypass } = req.body;
  const user = req.body;
  if (check.isMissingData([user.username, user.email, user.password, user.nickname, user["g-recaptcha-response"]]))
    return res.status(code.missingData).send(msg.missingData);

  if (user.password.length < 6)
    return res.status(code.invalidPassword).send(msg.invalidPassword);

  // Makes sure the e-mail is always lower case
  user.email = user.email.toLowerCase();

  // Request has bypass
  if (!bypass && bypass !== debugKey) {
    const secretKey = process.env.GOOGLE_CAPTCHA_V2_PRIVATE_KEY;
    // .env is not configured
    if (secretKey && secretKey != "key") {
      const googleRecaptcha = new GoogleRecaptcha({ secret: secretKey });
      // This can also take the user's IP as remoteIp
      await googleRecaptcha.verify({ response: user["g-recaptcha-response"] }, (error) => {
        if (error)
          return res.status(code.captchaFailed).send(msg.captchaFailed);
      });
    }
  }

  const created = await service.newUser(user);
  if (created.error != null)
    return res.status(code.badRequest).send({ error: created.error });

  const refresh = await accessTokenService.generateAccessTokenByRefreshToken(created.token, null);
  if (refresh.error != null)
    return res.status(code.badRequest).send({ error: refresh.error });

  res.cookie("access_token", refresh.access_token, cookieConfig);
  res.cookie("token", created.token, cookieConfig);
  return res.status(code.success).send(msg.success);
};


// DEBUG
exports.getAll = (req, res) => {
  model.findAll({
    attributes: ["username", "nickname", "about", "joined", "avatar"],
  }).then((result) => {
    if (!result) return res.status(404).json({});
    return res.status(200).json(result);
  });
};


// DEBUG
exports.getAllFull = (req, res) => {
  return model.findAll().then((result) => {
    if (!result) return res.status(404).json({});
    return res.status(200).json(result);
  }).catch(err => {
    return res.status(500).send({ message: err.message });
  });
};


exports.get = async function(req, res) {
  const { username } = req.params;
  if (check.isMissingData([username]))
    return res.status(code.missingData).send(msg.missingData);

  const user = await service.getUser(username, req.verified);
  if (user.error != null)
    return res.status(code.badRequest).send({ error: user.error });
  return res.status(code.success).send(user);
};


exports.getMe = async function(req, res) {
  const { username } = req.verified;
  const user = await service.getUserSimple(username);
  if (user == null)
    return res.status(code.notFound).json({});
  if (user.error != null)
    return res.status(code.badRequest).send({ error: user.error });

  return res.status(code.success).json(user);
};


// DEBUG
exports.getId = (req, res) => {
  return model.findOne({
    where: { user_id: req.params.userId },
  }).then((result) => {
    if (!result) return res.status(404).json({});
    return res.status(200).json(result);
  }).catch(err => {
    return res.status(500).send({ message: err.message });
  });
};


exports.updateUserProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new UserValidationError(errors.mapped());
    }

    const userId = req.verified.user_id;
    const { nickname, about, showMature } = req.body;

    const comment = await updateUserProfile(userId, nickname, about, showMature);
    return res.status(200).json({
      comment,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};


// TODO
exports.delete = (req, res) => {
  return model.destroy({
    where: { user_id: req.params.userId },
  }).then((result) => {
    if (!result) return res.status(404).json({});
    return res.status(200).json(result);
  }).catch(err => {
    return res.status(500).send({ message: err.message });
  });
};
