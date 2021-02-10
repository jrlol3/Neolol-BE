const docsController = require("../controllers/docsController");

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
   *      summary: Get the documentation for the API
   *      tags: [Help]
   *      responses:
   *        200:
   *          description: SUCCESS
   *        404:
   *          description: NOT_FOUND
   */
  app.route(["/api", "/swagger"])
    .get(docsController.getDocs);

};
