const userController = require("../controllers/userController");

// DEBUG ROUTES
// Routes that might need to be removed later
// Maybe in the future could become admin dashboard
module.exports = function(app) {
  /** @swagger
   * path:
   *  /users/:
   *    get:
   *      summary: Get all users
   *      tags: [Debug]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/user'
   */
  app.route("/users")
    .get(userController.getAll);


  /** @swagger
   * path:
   *  /fullusers/:
   *    get:
   *      summary: Get a debug version of all users info
   *      tags: [Debug]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/user'
   */
  app.route("/fullusers")
    .get(userController.getAllFull);


  /** @swagger
   * path:
   *  /user/:userId/:
   *    parameters:
   *    - name: userId
   *      in: path
   *      description: ID of the user
   *      required: true
   *      schema:
   *        type: integer
   *      example: 1
   *    get:
   *      summary: Get the profile of a user with that ID
   *      tags: [Debug]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/user'
   *        404:
   *          description: NOT_FOUND
   *    put:
   *      summary: Update the user with that ID
   *      tags: [Debug]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/api_response'
   *    delete:
   *      summary: Delete the user with that ID
   *      tags: [Debug]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/api_response'
   */
  app.route("/user/:userId")
    .get(userController.getId)
    .put(userController.updateUserProfile)
    .delete(userController.delete);

};
