;require("dotenv").config();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const unless = require("express-unless");

const port = process.env.PORT || 5000;
const app = express();

const whitelist = ["", "https://localhost", "https://localhost:3000", "http://localhost:3000", "https://dev.qa.neolol.com", "https://dev.staging.neolol.com", "https://neolol.com"];
const corsOptionsDelegate = function(req, callback) {
  let corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = {
      origin: true,
      credentials: true,
      allowedHeaders: "User-Agent,Keep-Alive,Content-Type",
    }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false, credentials: true }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

console.log(`API Server started on: ${port}`);
app.use(fileUpload({ createParentPath: true }));
app.use(cors(corsOptionsDelegate));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(err, req, res, next) {
  // Catches SyntaxError from bodyParser's JSON
  if (err.type === "entity.parse.failed") {
    res.status(400).send({ message: "SYNTAX_ERROR" });
  } else next();
});


const tokenMiddleware = require("./middlewares/tokenMiddleware");
const v3Captcha = require("./middlewares/v3CaptchaMiddleware");

// This will verify the user's browser cookies
app.use(tokenMiddleware.checkTokens);

// This checks for v3 Captcha on some pages
// There is a list with the exceptions in there
v3Captcha.check.unless = unless;
app.use(v3Captcha.check.unless(v3Captcha.unless));


const startDatabase = require("./database/databaseStarter");
const routes = require("./routes");

// Creates the database if necessary
// Checks for debug arguments too

exports.initApp = () => {
  return startDatabase(process.argv.slice(2)).then(() => {
    routes(app);
    // Registers all the routes
    return app.listen(port);
  });
};

// Helps with tests
exports.constants = require("./constants") ;
