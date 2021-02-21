function makeBasicPost(options = {}) {
  return {
    user_fk: 1,
    title: "Basic",
    extension: "jpg",
    bypass: process.env.DEBUG_KEY,
    ...options,
  };
};

function makeFrontPost(options = {}) {
  return {
    user_fk: 1,
    title: "Front",
    extension: "jpg",
    time_rising: "2012-01-01T12:00:00.000Z",
    time_front: "2012-01-01T13:00:00.000Z",
    bypass: process.env.DEBUG_KEY,
    ...options,
  };
};

exports.makeBasicPost = makeBasicPost;
exports.makeFrontPost = makeFrontPost;

exports.getAll = function() {
  return [
    makeBasicPost(),
    makeBasicPost({ title: "Cool video", extension: "mp4" }),
    makeBasicPost({ title: "Another user", user_fk: 2 }),
    makeBasicPost({ title: "Suspicious post", mature_content: true }),
    makeBasicPost({ title: "Nice post", original_content: true }),
    makeFrontPost(),

    makeFrontPost({ title: "Dead in Rising", time_front: null }),
    makeBasicPost({ title: "Terrible post", score: -42 }),
  ];
};
