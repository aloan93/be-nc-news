const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { getApis } = require("./controllers/apis.controllers");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api", getApis);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Internal Server Error");
});

module.exports = app;
