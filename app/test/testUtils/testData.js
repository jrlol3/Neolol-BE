exports.basicUser = {
  username: "test",
  nickname: "test",
  about: "password: '123456789'",
  password: "$2b$10$ZkqjfyihMd4BSCOWTePT6eSRF2PTaK0iWunRkq37sKc2PuXHzLVtK",
  email: "test@neolol.com",
  token: "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpybG9sIiwiZW1haWwiOiJqcmxvbEBnbWFpbC5jb20iLCJuaWNrbmFtZSI6ImpybG9sMyIsImV0YyI6Ind0Zj8iLCJpYXQiOjE1ODcyNzgyMTAsImF1ZCI6Imh0dHBzOi8vbmVvbG9sLmNvbSIsImlzcyI6Ikh1Z2VDbG9uZSIsInN1YiI6ImpybG9sIn0.2OQopaDZVb_jKHf3vTwKeDlf9DnI_TGlZR03e1UcPpYuqKvJti_IWvWc3que4zCzsmiUSFAWmT0FgbsJoiN_eA",
  salt: "$2b$10$ZkqjfyihMd4BSCOWTePT6e",
};

exports.basicPost = {
  user_fk: 1,
  title: "Omae wa mou shindeiru",
  extension: "webm",
};

exports.basicComment = {
  user_fk: 1,
  post_fk: 1,
  content: "This is the first comment, no threads no parents",
};

exports.childComment = {
  user_fk: 1,
  post_fk: 1,
  content: "This is a reply to a parent comment",
  parentCommentId: 1,
};

