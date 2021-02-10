const chai = require("chai");

const { expect } = chai;
const chaiHttp = require("chai-http");

const { initApp } = require("../app");
const serviceUtils = require("./testUtils/serviceUtils");
const dbUtils = require("./testUtils/dbUtils");
const testData = require("./testUtils/testData");

chai.use(chaiHttp);

describe("Comments endpoints", () => {
  let server;
  let db;
  before(async () => {
    server = await initApp();
    // eslint-disable-next-line global-require
    db = require("../models");
    await db.sequelize.sync({ force: { cascade: true } });
  });

  after( async () => {
    await server.close();
  });

  // beforeEach( async () => {
  //
  // });
  afterEach( async () => {
    await db.sequelize.sync({ force: { cascade: true } });
  });

  describe("GET /posts/:postId/comments", () => {
    it("should get no comments when there are not comments on post", async () => {
      await dbUtils.addUser(db);
      await dbUtils.addPost(db);
      const res = await chai.request(server)
        .get("/posts/1/comments");
      expect(res.status).to.be.eq(204);
      // eslint-disable-next-line no-unused-expressions
      expect(res.body).to.be.empty;
    });
    it("should error when accessing comments on nonexistent post", async () => {
      const res = await chai.request(server)
        .get("/posts/13/comments");
      expect(res.status).to.be.eq(404);
    });

    it("should get a comment without replies", async () => {
      await dbUtils.addUser(db);
      await dbUtils.addPost(db);
      await dbUtils.addParentComment(db);
      const res = await chai.request(server)
        .get("/posts/1/comments");
      expect(res.status).to.be.eq(200);
      expect(res.body.length).to.be.eql(1);
    });
    it("should get a comment with replies", async () => {
      await dbUtils.addUser(db);
      await dbUtils.addPost(db);
      await dbUtils.addChildComment(db);
      const res = await chai.request(server)
        .get("/posts/1/comments");
      expect(res.status).to.be.eq(200);
      expect(res.body.length).to.be.eql(1);
    });
  });

  describe("POST /posts/:postId/comments", async () => {
    // these tests require an authenticated user
    // so we'll generate tokens and add them to requests
    let newUser;
    beforeEach( async () => {
      newUser = await dbUtils.addUser(db);
      await dbUtils.addPost(db);
    });

    it ("should not allow unauthenticated users to post comments", async () => {
      const res = await chai.request(server)
        .post("/posts/1/comments")
        .type("application/json");
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
        .send(testData.basicComment);
      expect(res.status).to.be.eq(201, `Assertion failure; response body:\n${JSON.stringify(res.body)}\nAssertion failure message: `);
    });
    it ("should not allow posting invalid child comments", async () => {
      await dbUtils.addParentComment(db);
      const commentToSend = { ...testData.childComment };
      commentToSend.parentCommentId = 9999;
      const res = await chai.request(server)
        .post("/posts/1/comments")
        .type("application/json")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send(commentToSend);
      expect(res.status).to.be.eq(400);
    });
    it ("should allow posting a firstborn child comment and update parent", async () => {
      await dbUtils.addParentComment(db);
      const res = await chai.request(server)
        .post("/posts/1/comments")
        .type("application/json")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send(testData.childComment);
      expect(res.status).to.be.eq(201, `Assertion failure; response body:\n${JSON.stringify(res.body)}\nAssertion failure message: `);
      const childrenCommentsInDb = await dbUtils.getDbData(db,{ content: testData.childComment.content });
      expect(childrenCommentsInDb.length).to.be.eq(1);
      expect(childrenCommentsInDb[0]).to.deep.include({
        parent_fk: 1,
        thread_fk: 1,
        reply_depth: 1,
      });
      const parentCommentsInDb = await dbUtils.getDbData(db,{ content: testData.basicComment.content });
      expect(parentCommentsInDb.length).to.be.eq(1);
      expect(parentCommentsInDb[0]).to.deep.include({
        has_reply: true,
      });
    });
  });
});