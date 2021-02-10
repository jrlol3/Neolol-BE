const { checkSchema, body } = require("express-validator");

const userController = require("../controllers/userController");
const sessionController = require("../controllers/sessionController");

// USER ROUTES
// Routes regarding profiles and sessions
module.exports = function(app) {
  /** @swagger
   * path:
   *  /me:
   *    get:
   *      summary: Get the logged in user
   *      tags: [Users]
   *      security:
   *        - cookieAuth: []
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/user'
   *        401:
   *          description: NOT_AUTHENTICATED
   *        404:
   *          description: NOT_FOUND
   */

  app.route("/me")
    .patch(checkSchema(({
      nickname: {
        in: ["body"],
        isString: {
          errorMessage: "nickname should be string",
        },
        isLength: {
          errorMessage: "nickname should be between 3 and 24 characters",
          options: {
            min: 3,
            max: 24,
          },
        },
        optional: true,
      },
      about: {
        in: ["body"],
        isString: {
          errorMessage: "about section should be string",
        },
        isLength: {
          errorMessage: "about section should be less than 258 characters",
          options: {
            min: 0,
            max: 258,
          },
        },
        optional: true,
      },
      showMature: {
        in: ["body"],
        isBoolean: {
          errorMessage: "showMature should be boolean",
        },
        optional: true,
      },
      // This middleware checks the entire body at once, to make sure at least
      // one parameter is specified for modification
    })), body().custom((requestBody) => {
      const bodyKeys = Object.keys(requestBody);
      const fieldsWeCanUpdate = bodyKeys.filter((bodyItem) => ["nickname", "about", "showMature"].includes(bodyItem));
      // we need to return true if there is an error, and false otherwise
      return fieldsWeCanUpdate.length === 0;
    }).withMessage("At least one editable parameter is required") , userController.updateUserProfile);
  app.route("/me")
    .get(userController.getMe);


  /** @swagger
   * path:
   *  /users/:username:
   *    parameters:
   *    - name: username
   *      in: path
   *      description: Username of the user
   *      required: true
   *      example: username
   *      schema:
   *        type: string
   *        minLength: 3
   *        maxLength: 24
   *    get:
   *      summary: Get the profile of a user with that username
   *      tags: [Users]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/user'
   *        404:
   *          description: NOT_FOUND
   */
  app.route("/users/:username")
    .get(userController.get);


  /** @swagger
   * path:
   *  /auth:
   *    post:
   *      summary: Login with given credentials
   *      tags: [Users]
   *      requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                identification:
   *                  type: string
   *                  maxLength: 64
   *                  example: 'email@email.com'
   *                password:
   *                  type: string
   *                  maxLength: 32
   *                  example: 'password'
   *              required:
   *              - identification
   *              - password
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/api_response'
   *          headers:
   *            Set-Cookie:
   *              schema:
   *                type: string
   *                example: token=abcde12345; Path=/; HttpOnly
   *        400:
   *          description: ALREADY_SIGNED_IN
   *        401:
   *          description: INVALID_CREDENTIALS
   *        404:
   *          description: NOT_FOUND
   *        449:
   *          description: MISSING_DATA
   */
  app.route("/auth")
    .post(sessionController.authenticate);

  /** @swagger
   * path:
   *  /logout:
   *    get:
   *      summary: Removes credential cookies
   *      tags: [Users]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/api_response'
   *          headers:
   *            Set-Cookie:
   *              schema:
   *                type: string
   *                example: ''
   */
  app.route("/logout")
    .get(sessionController.logout);

  /** @swagger
   * path:
   *  /register:
   *    post:
   *      summary: Register a new user with given credentials
   *      tags: [Users]
   *      requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                username:
   *                  type: string
   *                  maxLength: 64
   *                  example: 'username'
   *                nickname:
   *                  type: string
   *                  maxLength: 64
   *                  example: 'cool_username'
   *                email:
   *                  type: string
   *                  maxLength: 64
   *                  example: 'email@email.com'
   *                password:
   *                  type: string
   *                  minLength: 6
   *                  maxLength: 32
   *                  example: 'password'
   *                g-recaptcha-response:
   *                  type: string
   *                  example: 'abcdef123456'
   *              required:
   *              - username
   *              - nickname
   *              - email
   *              - password
   *              - g-recaptcha-response
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/api_response'
   *          headers:
   *            Set-Cookie:
   *              schema:
   *                type: string
   *                example: token=abcde12345; Path=/; HttpOnly
   *        400:
   *          description: ALREADY_SIGNED_IN or CAPTCHA_FAILED
   *        449:
   *          description: MISSING_DATA or INVALID_PASSWORD
   */
  app.route("/register")
    .post(userController.create);

};
