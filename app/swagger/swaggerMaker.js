const swaggerJSDoc = require("swagger-jsdoc");
const fs = require("fs");
const YAML = require("json2yaml");
const v3Captcha = require("../middlewares/v3CaptchaMiddleware");
const schemasMaker = require("./schemasMaker");
const { msg, code } = require("../constants");

function addV3CaptchaToPaths(swagger) {
  const { paths } = swagger;
  Object.keys(paths).forEach(pathName => {
    const skipsCaptcha = v3Captcha.unless.path.some(unless => {
      // Workaround to check if it is a regex instead of a string
      let regex = false;
      if (typeof unless !== typeof "")
        regex = new RegExp(unless).test(pathName);
      if (regex || pathName === unless) {
        return true;
      }
    });

    // Huge workaround for every possibility
    if (!skipsCaptcha) {
      Object.keys(swagger.paths[pathName]).forEach(methodName => {
        if (!v3Captcha.excludedMethods.includes(methodName.toUpperCase())) {
          const recaptcha = {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    recaptcha_token: {
                      type: "string",
                    },
                  },
                  required: ["recaptcha_token"],
                },
              },
            },
          };

          const method = paths[pathName][methodName];

          if (!method.requestBody)
            method.requestBody = recaptcha;
          else if (!method.requestBody.content)
            method.requestBody.content = recaptcha.content;
          else if (!method.requestBody.content["application/json"])
            method.requestBody.content["application/json"] = recaptcha.content["application/json"];
          else if (!method.requestBody.content["application/json"].schema)
            method.requestBody.content["application/json"].schema = recaptcha.content["application/json"].schema;
          else if (!method.requestBody.content["application/json"].schema.properties)
            method.requestBody.content["application/json"].schema.properties = recaptcha.content["application/json"].schema.properties;
          else if (!method.requestBody.content["application/json"].schema.properties.recaptcha_token)
            method.requestBody.content["application/json"].schema.properties.recaptcha_token = recaptcha.content["application/json"].schema.properties.recaptcha_token;

          if (!method.requestBody.content["application/json"].schema.required)
            method.requestBody.content["application/json"].schema.required = recaptcha.content["application/json"].schema.required;
          else if (!method.requestBody.content["application/json"].schema.required.includes(recaptcha.content["application/json"].schema.required[0])) {
            method.requestBody.content["application/json"].schema.required.push(...recaptcha.content["application/json"].schema.required);
          }

          if (!paths[pathName][methodName].responses)
            paths[pathName][methodName].responses = { [code.captchaFailed]: { description: msg.captchaFailed.message } };
          else if (!paths[pathName][methodName].responses[code.captchaFailed])
            paths[pathName][methodName].responses[code.captchaFailed] = { description: msg.captchaFailed.message };
          else
            paths[pathName][methodName].responses[code.captchaFailed].description += ` or ${msg.captchaFailed.message}`;
        }
      },
      );
    };
  });
  return paths;
}


function generateSwagger() {
  const options = {
    definition: {
      openapi: "3.0.1",
      info: {
        title: "NEOLOL-API",
        description: "This is the API for the back-end of NEOLOL",
        version: "1.0.0",
      },
      servers: [
        { url: "https://api.neolol.com", description: "NEOLOL production server" },
        { url: "https://api.dev.qa.neolol.com", description: "NEOLOL dev server" },
        { url: "https://api.dev.staging.neolol.com", description: "NEOLOL staging server" },
      ],
    },
    // Path to the API docs
    apis: ["app/swagger/info.js", "app/routes/*Routes.js"],
  };

  // Initialize swagger-jsdoc -> returns validated swagger spec in json format
  return swaggerJSDoc(options);
}


exports.save = async function() {
  const swagger = generateSwagger();
  const schemas = await schemasMaker.generateSchemas();
  swagger.paths = addV3CaptchaToPaths(swagger);
  swagger.components.schemas = { ...swagger.components.schemas, ...schemas };

  const yaml = YAML.stringify(swagger);
  fs.writeFile("app/swagger/docs/api.yml", yaml, function(err) {
    if (err) return console.log(err);
  });
  fs.writeFile("docs/api.yml", yaml, function(err) {
    if (err) return console.log(err);
  });
  saveStaticHtmlDoc(swagger);
};

function saveStaticHtmlDoc(swagger) {
  const template = fs.readFileSync(`app/swagger/ui-template.html`);
  const page = template.toString().replace("{{{spec}}}", JSON.stringify(swagger));
  fs.writeFileSync("docs/swagger.html", page);
}