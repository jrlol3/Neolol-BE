const { JsonSchemaManager, OpenApi3Strategy } = require("@alt3/sequelize-to-json-schemas");
const toOpenApi = require("@openapi-contrib/json-schema-to-openapi-schema");
const { models } = require("../models").sequelize;

const schemaManager = new JsonSchemaManager({
  baseUri: "/",
  absolutePaths: true,
  secureSchemaUri: true,
  disableComments: true,
});

// Needs to be configured for each model
/*
* @param {string} options.title Name to be used as model property 'title'
* @param {string} options.description Text to be used as model property 'description'
* @param {array} options.exclude List of attribute names that will not be included in the generated schema
* @param {array} options.include List of attribute names that will be included in the generated schema
* @param {array} options.associations False to exclude all associations from the generated schema, defaults to true
* @param {array} options.excludeAssociations List of association names that will not be included in the generated schema
* @param {array} options.includeAssociations List of association names that will be included in the generated schema
*/
const options = {
  user: {
    exclude: ["salt"],
  },
};

const hiddenModels = [];


exports.generateSchemas = async function generateSchemas() {
  const schemas = {};
  Object.keys(models).forEach(async (modelName) => {
    if (!hiddenModels.includes(modelName)) {
      const model = models[modelName];
      const json = schemaManager.generate(model, new OpenApi3Strategy(), options[modelName]);
      const schema = await toOpenApi(json);
      schemas[modelName] = schema;
    }
  });
  return schemas;
};
