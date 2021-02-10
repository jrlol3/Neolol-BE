const db = require("../models");
const encryptionService = require("./encryptionService");
const { msg, code } = require("../constants");

const model = db.user;
const Op = db.operators;
const sql = db.sequelize.Sequelize;

exports.authenticate = async function(auth) {
  try {
    const account = await model.findOne({
      where: {
        [Op.or]: [
          // Surprisingly works; It's how you lower some column while searching.
          // Could use ILIKE too, but I think this is safer?
          sql.where(sql.fn("lower", sql.col("username")), auth.identification),
          { email: auth.identification },
        ],
      },
    });
    // Username or Email not found
    if (!account)
      return { status: code.invalidIdentification, error: msg.invalidIdentification };

    // If an account is found, checks the password
    const encryptedPassword = await encryptionService.encryptPassword(auth.password, account.salt);

    // Valid credentials
    if (encryptedPassword === account.password)
      return account;

    // Wrong password for that account
    return { status: code.invalidCredentials, error: msg.invalidCredentials };
  }
  catch(err) {
    return { status: code.badRequest, error: err.message };
  };
};


exports.verifySessionData = async function(session) {
  try {
    return await model.findOne({
      where: {
        username: session.username,
        user_id: session.user_id,
        email: session.email,
      },
    });
  }
  catch(err) {
    return { error: err.message };
  };
};
