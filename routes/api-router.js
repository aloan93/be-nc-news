const apiRouter = require("express").Router();
const { getApis } = require("../controllers/apis.controllers");
const { topicsRouter } = require("../routes/topics-router");
const { articlesRouter } = require("../routes/articles-router");
const { usersRouter } = require("./users-router");
const { commentsRouter } = require("./comments-router");

apiRouter.get("/", getApis);

apiRouter.use("/topics", topicsRouter);

apiRouter.use("/articles", articlesRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("/comments", commentsRouter);

module.exports = { apiRouter };
