const db = require("../models");
const service = require("../services/voteService");
const checkHelper = require("../helpers/checksHelper");
const { msg, code } = require("../constants");
const { debugKey } = require("../config/config");

const contentType = {
  post: {
    model: db.post_vote,
    contentModel: db.post,
    fkName: "post_fk",
  },
  comment: {
    model: db.comment_vote,
    contentModel: db.comment,
    fkName: "comment_fk",
  },
};


// Agnostic vote function, for both Posts and Comments
async function voteContent(req, res, model, contentId, parentPostId, type) {
  const { vote, bypass } = req.body;
  const user = req.verified;

  if (checkHelper.isMissingData([contentId, vote]))
    return res.status(code.missingData).send(msg.missingData);
  if (!checkHelper.isNumber(contentId) || !checkHelper.isNumber(vote))
    return res.status(code.badRequest).send(msg.badRequest);
  if (parentPostId != null && !checkHelper.isNumber(parentPostId))
    return res.status(code.badRequest).send(msg.badRequest);

  // Checks for same IP
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const anotherUserSameIp = await service.getSameIpOtherUser(model, user.user_id, ip, contentId, type.fkName);
  if (anotherUserSameIp != null && !bypass && bypass !== debugKey) {
    if (anotherUserSameIp.error != null)
      return res.status(400).send({ success: false, created: false, updated: false, error: anotherUserSameIp.error });
    return res.status(code.sameIp).send({ success: false, created: false, updated: false, error: msg.sameIp });
  }

  // Check if post/comment exists and update its 24h score if necessary
  const content = await service.getAndUpdate24h(type.contentModel, contentId, parentPostId);
  if (content == null)
    return res.status(code.notFound).send(msg.notFound);
  if (content.error != null)
    return res.status(code.badRequest).send({ success: false, created: false, updated: false, error: content.error });

  // Checks for an existing vote and updates accordingly
  const updatedVote = await service.updateExistingVote(type, user.user_id, vote, ip, contentId);
  if (updatedVote != null) {
    if (updatedVote.error != null)
      return res.status(code.badRequest).send({ success: false, created: false, updated: false, error: updatedVote.error });
    return res.status(200).send({ success: true, created: false, updated: true, debug: "update" });
  }

  // If it's a new vote, insert it
  const insertedVote = await service.newVote(type, user.user_id, vote, ip, contentId);
  if (insertedVote.error != null)
    return res.status(code.badRequest).send({ success: false, created: false, updated: false, error: insertedVote.error });
  return res.status(200).send({ success: (insertedVote != null), created: (insertedVote != null), updated: false, debug: "insert" });
}


exports.votePost = async function votePost(req, res) {
  await voteContent(req, res, db.post_vote, req.params.postId, null, contentType.post);
};


exports.voteComment = async function voteComment(req, res) {
  await voteContent(req, res, db.comment_vote, req.params.commentId, req.params.postId, contentType.comment);
};
