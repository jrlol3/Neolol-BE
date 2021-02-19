const docsController = require("../controllers/docsController");
const swaggerUi = require('swagger-ui-express');

// APP ROUTES
// Any static routes like docs, about, 404, etc
module.exports = function(app) {
  /** @swagger
   * path:
   *  /api:
   *    get:
   *      summary: Get the documentation for the API
   *      tags: [Help]
   *      responses:
   *        200:
   *          description: SUCCESS
   *        404:
   *          description: NOT_FOUND
   *  /swagger:
   *    get:
   *      summary: Get a Swagger UI documentation of the API
   *      tags: [Help]
   *      responses:
   *        200:
   *          description: SUCCESS
   *        404:
   *          description: NOT_FOUND
   */
  app.route("/api-docs.yml")
    .get(docsController.getDocs);

  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(docsController.readDocsYAML()));
};
