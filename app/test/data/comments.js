function makeBasicComment(options = {}) {
  return {
    user_fk: 1,
    post_fk: 1,
    content: "Basic comment",
    bypass: process.env.DEBUG_KEY,
    ...options,
  };
};

function makeReply(id, options = {}) {
  return {
    user_fk: 1,
    post_fk: 1,
    content: "Basic reply",
    parentCommentId: id || 1,
    bypass: process.env.DEBUG_KEY,
    ...options,
  };
};

function getReplyToPutInDB(parentId, options = {}) {
  return {
    user_fk: 1,
    post_fk: 1,
    content: "Basic reply",
    parent_fk: parentId || 1,
    bypass: process.env.DEBUG_KEY,
    ...options,
  };
};

exports.makeBasicComment = makeBasicComment;
exports.makeReply = makeReply;

exports.getAll = function() {
  return [
    makeBasicComment(),
    makeReply(1),
    makeReply(2),
    makeReply(1, { score: 11 }),
    makeReply(4, { deleted: true }),
    makeReply(5, { score: -11 }),
    makeBasicComment({ user_fk: 2 }),
    makeBasicComment({ post_fk: 2 }),
  ];
};

exports.getRepliesOnASinglePost = () => {
  return [
    makeBasicComment({ content: "this is number 0" }),
    getReplyToPutInDB(1, { content: "this is number 1" }),
    getReplyToPutInDB(2, { content: "this is number 2" }),
    getReplyToPutInDB(3, { content: "this is number 3" }),
    getReplyToPutInDB(4, { content: "this is number 4" }),
    getReplyToPutInDB(5, { content: "this is number 5" }),
    getReplyToPutInDB(1, { content: "this is number 6" }),
    getReplyToPutInDB(2, { content: "this is number 7" }),
  ];
};

exports.allCommentsAfterBeingInsertedInDB = function() {
  return [
    {
      attachment_extension: null,
      comment_id: 1,
      content: "this is number 0",
      deleted: false,
      downvotes: 0,
      edited: false,
      has_attachment: false,
      has_reply: true,
      parent_fk: null,
      post_fk: 1,
      replies: [
        {
          attachment_extension: null,
          comment_id: 2,
          content: "this is number 1",
          deleted: false,
          downvotes: 0,
          edited: false,
          has_attachment: false,
          has_reply: true,
          parent_fk: 1,
          post_fk: 1,
          replies: [
            {
              attachment_extension: null,
              comment_id: 3,
              content: "this is number 2",
              deleted: false,
              downvotes: 0,
              edited: false,
              has_attachment: false,
              has_reply: true,
              parent_fk: 2,
              post_fk: 1,
              replies: [],
              reply_depth: 2,
              score: 0,
              score_at_24h: null,
              thread_fk: 1,
              upvotes: 0,
              user: {
                avatar: null,
                is_admin: false,
                is_mod: false,
                nickname: "Basic User",
                username: "basic",
              },
              user_fk: 1,
              vote: null,
            },
            {
              attachment_extension: null,
              comment_id: 8,
              content: "this is number 7",
              deleted: false,
              downvotes: 0,
              edited: false,
              has_attachment: false,
              has_reply: false,
              parent_fk: 2,
              post_fk: 1,
              replies: [],
              reply_depth: 2,
              score: 0,
              score_at_24h: null,
              thread_fk: 1,
              upvotes: 0,
              user: {
                avatar: null,
                is_admin: false,
                is_mod: false,
                nickname: "Basic User",
                username: "basic",
              },
              user_fk: 1,
              vote: null,
            },
          ],
          reply_depth: 1,
          score: 0,
          score_at_24h: null,
          thread_fk: 1,
          upvotes: 0,
          user: {
            avatar: null,
            is_admin: false,
            is_mod: false,
            nickname: "Basic User",
            username: "basic",
          },
          user_fk: 1,
          vote: null,
        },
        {
          attachment_extension: null,
          comment_id: 7,
          content: "this is number 6",
          deleted: false,
          downvotes: 0,
          edited: false,
          has_attachment: false,
          has_reply: false,
          parent_fk: 1,
          post_fk: 1,
          replies: [],
          reply_depth: 1,
          score: 0,
          score_at_24h: null,
          thread_fk: 1,
          upvotes: 0,
          user: {
            avatar: null,
            is_admin: false,
            is_mod: false,
            nickname: "Basic User",
            username: "basic",
          },
          user_fk: 1,
          vote: null,
        },
      ],
      reply_depth: 0,
      score: 0,
      score_at_24h: null,
      thread_fk: null,
      upvotes: 0,
      user: {
        avatar: null,
        is_admin: false,
        is_mod: false,
        nickname: "Basic User",
        username: "basic",
      },
      user_fk: 1,
      vote: null,
    },
  ];
};
