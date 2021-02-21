function makeVote(options = {}) {
  return {
    post_id: 1,
    comment_id: 1,
    vote: 1,
    bypass: "YmFzZTY0IGVuY29kaW5nIGdvIGJycnJy",
    ...options,
  };
};

exports.makeVote = makeVote;
