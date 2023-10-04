const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const {
  getArticleById,
  getArticles,
  patchArticleById,
} = require("./controllers/articles.controllers.js");
const { getApis } = require("./controllers/apis.controllers");
const {
  getCommentsByArticleId,
} = require("./controllers/comments.controllers");

const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.get("/api", getApis);

app.patch("/api/articles/:article_id", patchArticleById);

// custom errors
app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ message: err.message });
  }
  next(err);
});

// psql errors
app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ message: "Invalid Data Type" });
  }
});

// failsafe (500)
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Internal Server Error");
});

module.exports = app;
