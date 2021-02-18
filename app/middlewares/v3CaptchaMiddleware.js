const fetch = require("isomorphic-fetch");
const check = require("../helpers/checksHelper");
const { msg, code } = require("../constants");
const { debugKey } = require("../config/config");

// Paths that will be excluded from the checks
exports.unless = {
  path: [
    "/",
    "/register",      // Already checks through v2 captcha
    "/me",
    "/fresh",
    /^\/fresh\/.*/,
    "/rising",
    /^\/rising\/.*/,
    "/front",
    /^\/front\/.*/,
    "/users",
    "/logout",
    /^\/post\/.*/,
    /^\/profile\/.*/,
    /^\/user\/.*/,
    "/api",
    "/swagger",
  ],
};

const excludedMethods = [
  "GET",
  "DELETE",
];
exports.excludedMethods = excludedMethods;

exports.check = async function (req, res, next) {
  // Add it to your .env file
  if (req.body.bypass && req.body.bypass === debugKey) {
    return next();
  }

  // Some methods don't need a captcha, like GET, due to not having a request body
  if (excludedMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  const { body } = req;
  if (check.isMissingData([body.recaptcha_token])) {
    return res.status(code.captchaFailed).send(msg.captchaFailed);
  }
  const secretKey = process.env.GOOGLE_CAPTCHA_V3_PRIVATE_KEY;
  // Bypass if there is no Captcha key on the .env
  if (!secretKey || secretKey == "key") {
    return next();
  }
  const token = body.recaptcha_token;
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
  const resp = await fetch(url, {
    method: "post",
  });
  const status = await resp.json();
  if (!status.success || status.score < 0.6) {
    return res.status(code.captchaFailed).send(msg.captchaFailed);
  }

  return next();
};
