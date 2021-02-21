/* eslint-disable global-require */
/* eslint-disable no-unused-expressions */
const chai = require("chai");
const fs = require("fs");
const process = require("process");
const chaiExclude = require("chai-exclude");

chai.use(chaiExclude);
const { expect } = chai;
const chaiHttp = require("chai-http");

const { initApp } = require("../app");
const serviceUtils = require("./utils/serviceUtils");
const { users, posts, comments } = require("./data");

chai.use(chaiHttp);
chai.use(chaiExclude);

describe("Post Endpoints", function() {
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


  describe("GET /posts/:postId", async function() {
    let newPost;
    let newUser;
    beforeEach( async () => {
      newUser = await dbUtils.addBasicUser();
      newPost = await dbUtils.addBasicPost();
    });

    it("should get a post successfully", async function() {
      const res = await chai.request(server)
        .get("/posts/1");
      expect(res.status).to.be.eq(200);
      expect(res.body).to.not.be.empty;
      expect(res.body.post_id).to.be.eq(newPost.post_id);
      expect(res.body.title).to.be.eq(newPost.title);
      expect(res.body.user.username).to.be.eq(newUser.username);
      expect(res.body.score).to.be.eq(false);
      expect(res.body.upvotes).to.be.eq(false);
      expect(res.body.downvotes).to.be.eq(false);
      expect(res.body.vote).to.be.eql(null);
    });

    it("should not hide score when owner of a new post", async function() {
      await dbUtils.addPost(posts.makeBasicPost());

      const res = await chai.request(server)
        .get("/posts/1")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser));

      expect(res.status).to.be.eq(200);
      expect(res.body.score).to.be.eq(0);
      expect(res.body.upvotes).to.be.eql(0);
      expect(res.body.downvotes).to.be.eql(0);
    });

    it("should get comments on the post", async function() {
      await dbUtils.addBasicComment();
      await dbUtils.addBasicComment();
      const res = await chai.request(server)
        .get("/posts/1");
      expect(res.status).to.be.eq(200);
      expect(res.body.comment_count).to.be.eq(2);
      expect(res.body.comments.length).to.be.eq(2);
    });

    it("should error when a post does not exist", async function() {
      const res = await chai.request(server)
        .get("/posts/999");
      expect(res.status).to.be.eq(404);
      // Should we add error messages on the tests?
      // expect(res.body.error).to.be.eql("Post not found");
    });
  });
  describe ("POST /posts", async function() {
    it("should not allow unauthenticated users to post", async function() {
      const res = await chai.request(server)
        .post("/posts")
        .type("application/json")
        .send(posts.makeBasicPost());
      expect(res.status).to.be.eq(401);
    });

    it("should allow authenticated users to post gifs", async function() {
      // we need to make sure there are no files in the debug_data folder
      fs.readdirSync("./debug_data/post").forEach((fileToDelete) => {
        fs.unlinkSync(`./debug_data/post/${fileToDelete}`);
      });
      const newUser = await dbUtils.addBasicUser();
      const res = await chai.request(server)
        .post("/posts")
        .field("bypass", process.env.DEBUG_KEY)
        .field("title", "cool title")
        .attach("files", fs.readFileSync("./app/test/data/test.gif"), "test.gif")
        .set("Cookie", await serviceUtils.getUserTokenAndAccessTokenCookies(newUser))
        .set("Content-Type", "application/x-www-form-urlencoded");
      expect(res.status).to.be.eq(200);
      expect(res.body).excludingEvery(["time_posted"]).to.be.deep.equal({
        msg: { message: "SUCCESS" },
        post: {
          comment_count: "0",
          score: "0",
          score_at_24h: "0",
          upvotes: "0",
          downvotes: "0",
          mature_content: "0",
          original_content: "0",
          post_id: 1,
          user_fk: 1,
          title: "cool title",
          extension: "gif",
        },
      });
      expect(fs.readdirSync("./debug_data/post/")).to.deep.equal(["1.gif"]);
      const latestPosts = await dbUtils.getAllPostsFromDB();
      expect(latestPosts.length).to.be.eq(1);
      expect(latestPosts[0].dataValues).excludingEvery(["time_posted"]).to.be.deep.equal({
        post_id: 1,
        user_fk: 1,
        title: "cool title",
        extension: "gif",
        time_rising: null,
        time_front: null,
        score: 0,
        score_at_24h: 0,
        upvotes: 0,
        downvotes: 0,
        comment_count: 0,
        mature_content: false,
        original_content: false,
        repost_fk: null,
        deleted: false,
      });
    });
  });
});
