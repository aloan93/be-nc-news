const {
  fetchCommentsByArticleId,
  removeCommentById,
  addCommentToArticleId,
} = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  return fetchCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentToArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  return addCommentToArticleId(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  return removeCommentById(comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      next(err);
    });
};
