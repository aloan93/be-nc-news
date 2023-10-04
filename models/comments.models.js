const db = require("../db/connection");
const { commentData } = require("../db/data/test-data");
const { checkArticleExists } = require("./articles.models");
const { checkUserExists } = require("./users.models");

exports.fetchCommentsByArticleId = (article_id) => {
  const doesExist = checkArticleExists(article_id);
  const query = db.query(
    `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
    [article_id]
  );
  return Promise.all([doesExist, query]).then((results) => {
    return results[1].rows;
  });
};

exports.addCommentToArticleId = (article_id, username, body) => {
  if (!username || !body) {
    return Promise.reject({
      status: 400,
      message: "Missing mandatory property",
    });
  }
  const doesUserExist = checkUserExists(username);
  const query = db.query(
    `INSERT INTO comments (body, article_id, author) VALUES ($1, $2, $3) RETURNING *;`,
    [body, article_id, username]
  );
  return Promise.all([doesUserExist, query]).then((results) => {
    return results[1].rows[0];
  });
};
