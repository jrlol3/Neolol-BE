/* eslint-disable no-nested-ternary */
exports.cookieConfig = {
  maxAge: 2678400 * 1000,
  httpOnly: true,
  sameSite: "none",
  domain: process.env.COOKIE_DOMAIN,
  secure: process.env.COOKIE_SECURE === "false" ? false : process.env.COOKIE_SECURE === "true" ? true : process.env.COOKIE_SECURE || false,
};

exports.cookieConfigReset = {
  maxAge: 0,
  httpOnly: true,
  sameSite: "none",
  domain: process.env.COOKIE_DOMAIN,
  secure: process.env.COOKIE_SECURE === "false" ? false : process.env.COOKIE_SECURE === "true" ? true : process.env.COOKIE_SECURE || false,
};
