const { checkSchema } = require("express-validator");
const commentController = require("../controllers/commentController");
const voteController = require("../controllers/voteController");
const commentErrorMiddleware = require("../middlewares/commentErrorHandler");

// COMMENT ROUTES
// Routes regarding comments and replies
module.exports = function(app) {
  /** @swagger
   * path:
   *  /posts/:postId/comments/:
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
   *      summary: Get the comments of a post with that ID
   *      tags: [Comments]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/comment'
   *        404:
   *          description: NOT_FOUND
   */
  app.route("/posts/:postId/comments/")
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
    })), commentController.getFromPost);


  /** @swagger
   * path:
   *  /posts/:postId/comments/:commentId:
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
   *    - name: commentId
   *      in: path
   *      description: ID of the parent comment
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
   *      summary: Get the comment and its replies
   *      tags: [Comments]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/comment'
   *        404:
   *          description: NOT_FOUND
   *    patch:
   *      summary: Change a comment's content
   *      tags: [Comments]
   *      requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                content:
   *                  type: string
   *                  maxLength: 4096
   *                  example: 'YEET'
   *              required:
   *                - content
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/api_response'
   *        404:
   *          description: NOT_FOUND
   *    delete:
   *      summary: Delete a comment
   *      tags: [Comments]
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
  app.route("/posts/:postId/comments/:commentId")
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
      commentId: {
        in: ["params"],
        exists: {
          errorMessage: "missing commentId",
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
    })), commentController.getCommentWithReplies)
    // PATCH
    .patch(checkSchema(({
      commentId: {
        in: ["params"],
        exists: {
          errorMessage: "missing commentId",
        },
        isInt: {
          errorMessage: "commentId should be int",
        },
      },
      postId: {
        in: ["params"],
        exists: {
          errorMessage: "missing postId",
        },
        isInt: {
          errorMessage: "postId should be int",
        },
      },
      content: {
        in: ["body"],
        exists: {
          errorMessage: "missing content",
        },
        isString: {
          errorMessage: "content should be a string",
        },
        isLength: {
          errorMessage: "content can't be longer than 4096 characters",
          options: {
            max: 4096,
          },
        },
      },
    })), commentController.editCommentContent)
    // DELETE
    .delete(checkSchema(({
      commentId: {
        in: ["params"],
        exists: {
          errorMessage: "missing commentId",
        },
        isInt: {
          errorMessage: "commentId should be int",
        },
      },
      postId: {
        in: ["params"],
        exists: {
          errorMessage: "missing postId",
        },
        isInt: {
          errorMessage: "postId should be int",
        },
      },
    })), commentController.deleteComment);


  /** @swagger
   * path:
   *  /users/:username/comments:
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
   *      summary: Get the last 10 comments of a user
   *      tags: [Comments]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/comment'
   *        404:
   *          description: NOT_FOUND
   *
   *  /users/:username/comments/:offset:
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
   *      description: Previous last comment count
   *      required: true
   *      example: 1
   *      schema:
   *        type: integer
   *        minimum: 1
   *        maximum: 9999999
   *    get:
   *      summary: Get 10 comments of a user after the offset
   *      tags: [Comments]
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/comment'
   *        404:
   *          description: NOT_FOUND
   */
  app.route(["/users/:username/comments", "/users/:username/comments/:offset"])
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
    })), commentController.getOnProfile);

  /** @swagger
   * path:
   *  /posts/:postId/comments/:commentId/vote:
   *    put:
   *      summary: Vote on a comment, upvote with 1, downvote with 0 and no vote with 2
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
   *                - vote
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
   *    - name: commentId
   *      in: path
   *      description: ID of the comment
   *      required: true
   *      example: 1
   *      schema:
   *        type: integer
   *        minimum: 1
   *        maximum: 9999999
   */
  app.route("/posts/:postId/comments/:commentId/vote")
    .put(voteController.voteComment);

  /** @swagger
   * path:
   *  /posts/:postId/comments/:commentId:
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
   *    - name: commentId
   *      in: path
   *      description: ID of the parent comment
   *      required: true
   *      example: 1
   *      schema:
   *        type: integer
   *        minimum: 1
   *        maximum: 9999999
   *    post:
   *      summary: Make a new comment on a post; can be a reply and can have an attachment
   *      tags: [Comments]
   *      requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                content:
   *                  type: string
   *                  maxLength: 4096
   *                  example: 'YEET'
   *                attachment:
   *                  type: buffer
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/api_response'
   *        400:
   *          description: BAD_REQUEST
   *        401:
   *          description: NOT_AUTHENTICATED
   *        404:
   *          description: NOT_FOUND
   *        449:
   *          description: MISSING_DATA *
   *
   *  /posts/:postId/comments/:
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
   *    post:
   *      summary: Make a new comment on a post; can be a reply and can have an attachment
   *      tags: [Comments]
   *      requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                content:
   *                  type: string
   *                  maxLength: 4096
   *                  example: 'YEET'
   *                attachment:
   *                  type: buffer
   *      responses:
   *        200:
   *          description: SUCCESS
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/api_response'
   *        400:
   *          description: BAD_REQUEST
   *        401:
   *          description: NOT_AUTHENTICATED
   *        404:
   *          description: NOT_FOUND
   *        449:
   *          description: MISSING_DATA
   */
  app.route(["/posts/:postId/comments/"])
    .post(checkSchema(({
      postId: {
        in: ["params"],
        exists: {
          errorMessage: "missing postId",
        },
        isInt: {
          errorMessage: "postId should be int",
        },
      },
      content: {
        in: ["body"],
        isString: true,
        isLength: {
          options: {
            max: 4096,
          },
        },
        optional: true,
      },
      parentCommentId: {
        in: ["body"],
        isInt: {
          errorMessage: "parentCommentId should be int",
        },
        optional: true,
      },
    })), commentController.create);

  app.use(commentErrorMiddleware);
};
