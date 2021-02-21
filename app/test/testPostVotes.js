/* eslint-disable global-require */
/* eslint-disable no-unused-expressions */
const chai = require("chai");
const chaiExclude = require("chai-exclude");

chai.use(chaiExclude);
const { expect } = chai;
const chaiHttp = require("chai-http");

const { initApp, constants } = require("../app");
const serviceUtils = require("./utils/serviceUtils");
const { users, posts, votes } = require("./data");

chai.use(chaiHttp);
chai.use(chaiExclude);

describe("Post Vote Endpoints", function() {
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

  describe ("PUT /posts/:postId/vote", async function() {
    let newPost;
    let newUser;
    beforeEach( async () => {
      newUser = await dbUtils.addBasicUser();
      newPost = await dbUtils.addBasicPost();
    });

    it("should not allow unauthenticated users to vote", async function() {
      const res = await chai.request(server)
        .put("/posts/1/vote")
        .type("application/json")
        .send(votes.makeVote());
      expect(res.status).to.be.eq(401);
    });

    it("should allow authenticated users to vote", async function() {
      const res = await chai.request(server)
        .put("/posts/1/vote")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send(votes.makeVote());
      expect(res.status).to.be.eq(200);
    });

    it("should update the post's score", async function() {
      let res = await chai.request(server)
        .put("/posts/1/vote")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send(votes.makeVote({ vote: 1 }));
      expect(res.status).to.be.eq(200);

      res = await chai.request(server)
        .get("/posts/1")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser));
      expect(res.status).to.be.eq(200);
      expect(res.body.score).to.be.eq(1);
      expect(res.body.upvotes).to.be.eq(1);
      expect(res.body.downvotes).to.be.eq(0);

      res = await chai.request(server)
        .put("/posts/1/vote")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send(votes.makeVote({ vote: 0 }));
      expect(res.status).to.be.eq(200);

      res = await chai.request(server)
        .get("/posts/1")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser));
      expect(res.status).to.be.eq(200);
      expect(res.body.score).to.be.eq(-1);
      expect(res.body.upvotes).to.be.eq(0);
      expect(res.body.downvotes).to.be.eq(1);

      res = await chai.request(server)
        .put("/posts/1/vote")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send(votes.makeVote({ vote: 2 }));
      expect(res.status).to.be.eq(200);

      res = await chai.request(server)
        .get("/posts/1")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser));
      expect(res.status).to.be.eq(200);
      expect(res.body.score).to.be.eq(0);
      expect(res.body.upvotes).to.be.eq(0);
      expect(res.body.downvotes).to.be.eq(0);
    });

    it("should push posts to Front", async function() {
      await dbUtils.addPost(posts.makeBasicPost({ score: constants.provenances.FRONT.score }));
      let res = await chai.request(server)
        .put("/posts/2/vote")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send(votes.makeVote());
      expect(res.status).to.be.eq(200);

      res = await chai.request(server)
        .get("/posts/2")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser));
      expect(res.status).to.be.eq(200);
      expect(res.body.time_front).to.not.be.eql(null);
    });

    it("should hide negative posts", async function() {
      await dbUtils.addPost(posts.makeBasicPost({ score: constants.provenances.DEFAULT.score + 1 }));
      let res = await chai.request(server)
        .put("/posts/2/vote")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send(votes.makeVote({ vote: 0 }));
      expect(res.status).to.be.eq(200);

      res = await chai.request(server)
        .get("/fresh");
      expect(res.status).to.be.eq(200);
      expect(res.body.length).to.be.eq(1);

      res = await chai.request(server)
        .put("/posts/2/vote")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .send(votes.makeVote({ vote: 1 }));
      expect(res.status).to.be.eq(200);

      res = await chai.request(server)
        .get("/fresh");
      expect(res.status).to.be.eq(200);
      expect(res.body.length).to.be.eq(2);
    });

    it("should error when a post does not exist", async function() {
      const res = await chai.request(server)
        .get("/posts/999/vote");
      expect(res.status).to.be.eq(404);
    });
  });
});
