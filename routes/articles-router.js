const articlesRouter = require("express").Router();
const {
  getArticleById,
  getArticles,
  patchArticleById,
  postArticle,
} = require("../controllers/articles.controllers.js");
const {
  getCommentsByArticleId,
  postCommentToArticleId,
} = require("../controllers/comments.controllers.js");

articlesRouter.get("/", getArticles);

articlesRouter.get("/:article_id", getArticleById);

articlesRouter.patch("/:article_id", patchArticleById);

articlesRouter.get("/:article_id/comments", getCommentsByArticleId);

articlesRouter.post("/:article_id/comments", postCommentToArticleId);

articlesRouter.post("/", postArticle);

module.exports = { articlesRouter };
