exports.basicUser = {
  username: '',
  nickname: '',
  about: '',
  password: '',
  email: '',
  token: '',
  salt: '',
};

exports.basicPost = {
  user_fk: 1,
  title: 'Omae wa mou shindeiru',
  extension: 'webm',
};

exports.basicComment = {
  user_fk: 1,
  post_fk: 1,
  content: 'This is the first comment, no threads no parents',
};

exports.childComment = {
  user_fk: 1,
  post_fk: 1,
  content: 'This is a reply to a parent comment',
  parentCommentId: 1,
};
