const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { getArticleById } = require("./controllers/articles.controllers.js");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

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
