/* eslint-disable no-unused-expressions */
/* eslint-disable global-require */
const chai = require("chai");
const chaiExclude = require("chai-exclude");

const { expect } = chai;
const chaiHttp = require("chai-http");

const { initApp } = require("../app");
const serviceUtils = require("./utils/serviceUtils");
const { users, posts, comments } = require("./data");

chai.use(chaiHttp);
chai.use(chaiExclude);

describe("Comments endpoints", function() {
  const db = require("../models");
  // Helps with autocomplete
  let dbUtils = require("./utils/dbUtils");
  let server;
  before(async function() {
    this.timeout(5000);
    server = await initApp();
    await db.sequelize.sync({ force: { cascade: true } });
    // Helps with not needing to pass db at every operation
    dbUtils = require("./utils/dbUtils").init(db);
  });

  after( async () => {
    await server.close();
  });

  afterEach(async function() {
    this.timeout(5000);
    await db.sequelize.sync({ force: { cascade: true } });
  });

  describe("GET /posts/:postId/comments", () => {
    it("should get no comments when there are no comments on post", async () => {
      await dbUtils.addBasicUser();
      await dbUtils.addBasicPost();
      const res = await chai.request(server)
        .get("/posts/1/comments");
      expect(res.status).to.be.eq(204);
      expect(res.body).to.be.empty;
    });
    it("should error when accessing comments on nonexistent post", async () => {
      const res = await chai.request(server)
        .get("/posts/13/comments");
      expect(res.status).to.be.eq(404);
    });

    it("should get a comment without replies", async () => {
      await dbUtils.addBasicUser();
      await dbUtils.addBasicPost();
      await dbUtils.addBasicComment();
      const res = await chai.request(server)
        .get("/posts/1/comments");
      expect(res.status).to.be.eq(200);
      expect(res.body.length).to.be.eql(1);
    });
    it("should get a comment with replies", async () => {
      await dbUtils.addBasicUser();
      await dbUtils.addBasicPost();
      await dbUtils.addNestedComments();
      const res = await chai.request(server)
        .get("/posts/1/comments");
      expect(res.status).to.be.eq(200);
      expect(res.body).excludingEvery(["time_posted"]).to.be.eql(comments.allCommentsAfterBeingInsertedInDB());
    });
  });

  describe("POST /posts/:postId/comments", async () => {
    // these tests require an authenticated user
    // so we'll generate tokens and add them to requests
    let newUser;
    let newPost;
    beforeEach( async () => {
      newUser = await dbUtils.addBasicUser();
      newPost = await dbUtils.addBasicPost();
    });

    it ("should not allow unauthenticated users to post comments", async () => {
      const res = await chai.request(server)
        .post("/posts/1/comments")
        .type("application/json")
        .send(comments.makeBasicComment());
      expect(res.status).to.be.eq(401);
    });
    it ("should not allow requests with invalid data", async () => {
      const res = await chai.request(server)
        .post("/posts/123/comments")
        .type("application/json")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send();
      expect(res.status).to.be.eq(400);
    });
    it ("should allow posting a parent comment", async () => {
      const res = await chai.request(server)
        .post("/posts/1/comments")
        .type("application/json")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send(comments.makeBasicComment());
      expect(res.status).to.be.eq(201, `Assertion failure; response body:\n${JSON.stringify(res.body)}\nAssertion failure message: `);
    });
    it ("should not allow posting invalid child comments", async () => {
      await dbUtils.addBasicComment();
      const commentToSend = comments.makeReply(999);
      const res = await chai.request(server)
        .post("/posts/1/comments")
        .type("application/json")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send(commentToSend);
      expect(res.status).to.be.eq(400);
    });
    it ("should allow posting a firstborn child comment and update parent", async () => {
      await dbUtils.addBasicComment();
      const res = await chai.request(server)
        .post("/posts/1/comments")
        .type("application/json")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send(comments.makeReply());
      expect(res.status).to.be.eq(201, `Assertion failure; response body:\n${JSON.stringify(res.body)}\nAssertion failure message: `);
      const childrenCommentsInDb = await dbUtils.getDbData({ content: comments.makeReply().content });
      expect(childrenCommentsInDb.length).to.be.eq(1);
      expect(childrenCommentsInDb[0]).to.deep.include({
        parent_fk: 1,
        thread_fk: 1,
        reply_depth: 1,
      });
      const parentCommentsInDb = await dbUtils.getDbData({ content: comments.makeBasicComment().content });
      expect(parentCommentsInDb.length).to.be.eq(1);
      expect(parentCommentsInDb[0]).to.deep.include({
        has_reply: true,
      });
    });
  });

  describe("PATCH on /posts/:postId/comments/:commentId", async function() {
    let newUser;
    let newPost;
    let newComment;
    beforeEach( async function () {
      newUser = await dbUtils.addBasicUser();
      newPost = await dbUtils.addBasicPost();
      newComment = await dbUtils.addBasicComment();
      await dbUtils.addBasicComment();
    });
    it("should allow updating comment content", async function () {
      const res = await chai.request(server)
        .patch("/posts/1/comments/1")
        .type("application/json")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send({ content: "updated title",
          bypass: process.env.DEBUG_KEY });
      expect(res.status).to.be.eq(200);
      expect(res.body.content).to.be.eq("updated title");
    });
    it("should not allow unauthorized requests", async function () {
      const res = await chai.request(server)
        .patch("/posts/1/comments/1")
        .type("application/json")
        .send({ content: "updated title",
          bypass: process.env.DEBUG_KEY });
      expect(res.status).to.be.eq(401);
    });
    it("should not allow a user to edit another user's comment", async function () {
      const evilUser = await dbUtils.addUser(users.makeAnotherUser());
      const res = await chai.request(server)
        .patch("/posts/1/comments/1")
        .type("application/json")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(evilUser))
        .send({ content: "updated title",
          bypass: process.env.DEBUG_KEY });
      expect(res.status).to.be.eq(401);
    });
    it("should not allow updating comments on unexistent posts", async function () {
      const res = await chai.request(server)
        .patch("/posts/999/comments/1")
        .type("application/json")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send({ content: "updated title",
          bypass: process.env.DEBUG_KEY });
      expect(res.status).to.be.eq(404);
    });
    it("should not allow updating unexistent comments", async function () {
      const res = await chai.request(server)
        .patch("/posts/1/comments/999")
        .type("application/json")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send({ content: "updated title",
          bypass: process.env.DEBUG_KEY });
      expect(res.status).to.be.eq(404);
    });
  });

  describe("DELETE on /posts/:postId/comments/:commentId", async function() {
    let newUser;
    let newPost;
    let newComment;
    beforeEach( async function () {
      newUser = await dbUtils.addBasicUser();
      newPost = await dbUtils.addBasicPost();
      newComment = await dbUtils.addBasicComment();
      await dbUtils.addBasicComment();
    });
    it("should allow deleting a comment", async function () {
      const res = await chai.request(server)
        .delete("/posts/1/comments/1")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser));
      expect(res.status).to.be.eq(200);
    });
    it("should not allow unauthorized delete requests", async function () {
      const res = await chai.request(server)
        .delete("/posts/1/comments/1");
      expect(res.status).to.be.eq(401);
    });
    it("should not allow a user to delete another user's comment", async function () {
      const evilUser = await dbUtils.addUser(users.makeAnotherUser());
      const res = await chai.request(server)
        .delete("/posts/1/comments/1")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(evilUser));
      expect(res.status).to.be.eq(401);
    });
    it("should not allow deleting comments on unexistent posts", async function () {
      const res = await chai.request(server)
        .delete("/posts/999/comments/1")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser));
      expect(res.status).to.be.eq(404);
    });
    it("should not allow deleting unexistent comments", async function () {
      const res = await chai.request(server)
        .delete("/posts/1/comments/999")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser));
      expect(res.status).to.be.eq(404);
    });
  });
});
