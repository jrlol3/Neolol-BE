const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const privateKEY = fs.readFileSync(`${__dirname}/../config/keys/refreshprivate.key`, "utf8");
const privateKEYAccess = fs.readFileSync(`${__dirname}/../config/keys/private.key`, "utf8");
const i = "NeoLol";          // Issuer
const a = "https://neolol.com"; // Audience

const expiresIn = "1h";


exports.encrypt = async function(credentials) {
  try {
    const usedPayload = JSON.parse(JSON.stringify(credentials));
    const refreshPayload = {
      username: usedPayload.username,
      email: usedPayload.email,
      nickname: usedPayload.nickname,
      etc: usedPayload["g-recaptcha-response"],
    };

    const signOptions = {
      issuer: i,
      subject: usedPayload.username,
      audience: a,
      algorithm: "HS512",
    };

    usedPayload.token = jwt.sign(refreshPayload, privateKEY, signOptions);
    usedPayload.salt = await bcrypt.genSalt(10);
    usedPayload.password = await bcrypt.hash(usedPayload.password, usedPayload.salt);
    return usedPayload;
  }
  catch (error) {
    return { error: "Failed encryption" };
  }
};


exports.verifyToken = function(token, accessToken) {
  return new Promise((resolve) => {
    const verifyOptions = {
      issuer: i,
      audience: a,
      algorithm: ["HS512"],
    };

    let legit = {};
    if (accessToken) {
      legit = jwt.verify(accessToken, privateKEYAccess, verifyOptions);
    } else {
      legit = jwt.verify(token, privateKEY, verifyOptions);
    }

    return resolve(legit);
  });
};


exports.generateSessionToken = function(payload) {
  try{
    const usedPayload = JSON.parse(JSON.stringify(payload));
    return new Promise((resolve) => {
      const s = usedPayload.username;
      const signOptions = {
        issuer: i,
        subject: s,
        audience: a,
        expiresIn,
        algorithm: "HS512",
      };
      const token = jwt.sign(usedPayload, privateKEYAccess, signOptions);
      return resolve(token);
    });
  }
  catch(err) {
    return { error: err.message };
  }
};


exports.verifySession = async function(token) {
  return new Promise((resolve) => {
    const verifyOptions = {
      issuer: i,
      audience: a,
      expiresIn,
      algorithm: ["HS512"],
    };
    const legit = jwt.verify(token, privateKEYAccess, verifyOptions);
    const now = new Date() / 1000 || 0;
    if (legit.exp <= now) {
      return resolve({ error: true });
    }

    return resolve({ ...legit, now });
  });
};


exports.encryptPassword = async function(password, salt) {
  return bcrypt.hash(password, salt);
};
