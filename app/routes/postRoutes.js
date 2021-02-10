const { checkSchema } = require("express-validator");
const postController = require("../controllers/postController");
const voteController = require("../controllers/voteController");
const errorHandlerMiddleware = require("../middlewares/postErrorHandler");

// POST ROUTES
// Routes regarding posts and provenances
module.exports = function(app) {

  /** @swagger
   * path:
   *  /:
   *    get:
   *      summary: Home page, gets front posts
   *      tags: [Provenances]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/post'
   *
   *  /front/:
   *    get:
   *      summary: Get front posts
   *      tags: [Provenances]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/post'
   *
   *  /front/:after:
   *    parameters:
   *    - name: after
   *      in: path
   *      required: true
   *      description: Previous last post
   *      example: 1
   *      schema:
   *        type: integer
   *        minimum: 1
   *        maximum: 9999999
   *    get:
   *      summary: Get front posts after the provided post ID
   *      tags: [Provenances]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/post'
   */
  app.route(["/", "/front", "/front/:after"])
    .get(postController.getFrontPosts);

  /** @swagger
   * path:
   *  /rising:
   *    get:
   *      summary: Get rising posts
   *      tags: [Provenances]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/post'
   *
   *  /rising/:after:
   *    parameters:
   *    - name: after
   *      in: path
   *      description: Previous last post
   *      required: true
   *      example: 1
   *      schema:
   *        type: integer
   *        minimum: 1
   *        maximum: 9999999
   *    get:
   *      summary: Get rising posts after the provided post ID
   *      tags: [Provenances]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/post'
   */
  app.route(["/rising", "/rising/:after"])
    .get(postController.getRisingPosts);


  /** @swagger
   * path:
   *  /fresh:
   *    get:
   *      summary: Get fresh posts
   *      tags: [Provenances]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/post'
   *
   *  /fresh/:after:
   *    parameters:
   *    - name: after
   *      in: path
   *      description: Previous last post
   *      required: true
   *      example: 1
   *      schema:
   *        type: integer
   *        minimum: 1
   *        maximum: 9999999
   *    get:
   *      summary: Get fresh posts after the provided post ID
   *      tags: [Provenances]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/post'
   */
  app.route(["/fresh", "/fresh/:after"])
    .get(postController.getFreshPosts);


  /** @swagger
   * path:
   *  /users/:username/posts:
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
   *      summary: Get the last 10 posts of a user
   *      tags: [Posts]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/post'
   *        404:
   *          description: NOT_FOUND
   *
   *  /users/:username/posts/:offset:
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
   *    - name: offset
   *      in: path
   *      description: Previous last post count
   *      required: true
   *      example: 1
   *      schema:
   *        type: integer
   *        minimum: 1
   *        maximum: 9999999
   *    get:
   *      summary: Get 10 posts of a user after the offset
   *      tags: [Posts]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/post'
   *        404:
   *          description: NOT_FOUND
   */
  app.route(["/users/:username/posts", "/users/:username/posts/:offset"])
    .get(checkSchema(({
      username: {
        in: ["params"],
        exists: {
          errorMessage: "missing username",
        },
        isLength: {
          errorMessage: "username can't be longer than 64 characters",
          options: {
            max: 64,
          },
        },
      },
      offset: {
        in: ["params"],
        optional: true,
        isInt: {
          errorMessage: "offset should be int",
        },
      },
    })), postController.getOnProfile);


  /** @swagger
   * path:
   *  /posts/:postId:
   *    parameters:
   *    - name: postId
   *      in: path
   *      description: ID of the post
   *      required: true
   *      example: 1
   *      schema:
   *        type: integer
   *        minimum: 1
   *        maximum: 9999999
   *    - name: depth
   *      in: query
   *      description: How many replies each comment can have
   *      required: false
   *      example: 3
   *      schema:
   *        type: integer
   *        minimum: 0
   *        maximum: 16
   *    get:
   *      summary: Get the post with that ID and its comments
   *      tags: [Posts]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/post'
   *        404:
   *          description: NOT_FOUND
   *    patch:
   *      summary: Change a post's title
   *      tags: [Posts]
   *      requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                title:
   *                  type: string
   *                  maxLength: 4096
   *                  example: 'YEET'
   *              required:
   *                - title
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/api_response'
   *        400:
   *          description: VALIDATION_ERROR
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/api_response'
   *        404:
   *          description: NOT_FOUND
   *    delete:
   *      summary: Delete a post
   *      tags: [Posts]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/api_response'
   *        404:
   *          description: NOT_FOUND
   */
  app.route("/posts/:postId")
    // GET
    .get(checkSchema(({
      postId: {
        in: ["params"],
        exists: {
          errorMessage: "missing postId",
        },
        isInt: {
          errorMessage: "postId should be int",
        },
      },
      depth: {
        in: ["query"],
        isInt: true,
        optional: true,
        isLength: {
          errorMessage: "replies depth should be between 0 and 16",
          options: {
            min: 0,
            max: 16,
          },
        },
      },
    })), postController.get)
    // PATCH
    .patch(checkSchema(({
      postId: {
        in: ["params"],
        exists: {
          errorMessage: "missing postId",
        },
        isInt: {
          errorMessage: "postId should be int",
        },
      },
      title: {
        in: ["body"],
        exists: {
          errorMessage: "missing content",
        },
        isString: {
          errorMessage: "title should be a string",
        },
        isLength: {
          errorMessage: "title can't be longer than 4096 characters",
          options: {
            max: 4096,
          },
        },
      },
    })), postController.editPostTitle)
    // DELETE
    .delete(checkSchema(({
      postId: {
        in: ["params"],
        exists: {
          errorMessage: "missing postId",
        },
        isInt: {
          errorMessage: "postId should be int",
        },
      },
    })), postController.deletePost);

  /** @swagger
   * path:
   *  /posts:
   *    post:
   *      summary: Upload a new post
   *      tags: [Posts]
   *      requestBody:
   *        content:
   *          multipart/form-data:
   *            schema:
   *              type: object
   *              properties:
   *                postFile:
   *                  type: string
   *                  format: binary
   *                  description: The file to be uploaded
   *                title:
   *                  type: string
   *                  description: The title of the post
   *                  minLength: 5
   *                  maxLength: 64
   *                  example: YEET
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/api_response'
   */
  app.route("/posts")
    .post(postController.uploadPost);

  /** @swagger
   * path:
   *  /posts/:postId/vote:
   *    put:
   *      summary: Vote on a post, upvote with 1, downvote with 0 and no vote with 2
   *      tags: [Votes]
   *      requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                vote:
   *                  type: integer
   *                  minimum: 0
   *                  maximum: 2
   *                  example: 1
   *              required:
   *              - vote
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/api_response'
   *        400:
   *          description: BAD_REQUEST or SAME_IP
   *        401:
   *          description: NOT_AUTHENTICATED
   *        404:
   *          description: NOT_FOUND
   *        449:
   *          description: MISSING_DATA
   *    parameters:
   *    - name: postId
   *      in: path
   *      description: ID of the post
   *      required: true
   *      example: 1
   *      schema:
   *        type: integer
   *        minimum: 1
   *        maximum: 9999999
   */
  app.route("/posts/:postId/vote")
    .put(voteController.votePost);

  app.use(errorHandlerMiddleware);
};
