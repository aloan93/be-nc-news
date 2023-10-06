const db = require("../db/connection");
const { checkArticleExists } = require("./articles.models");
const { checkUserExists } = require("./users.models");

exports.fetchCommentsByArticleId = (article_id, limit = 10, p = 1) => {
  const doesExist = checkArticleExists(article_id);
  const query = db.query(
    `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET ${
      (p - 1) * limit
    };`,
    [article_id, limit]
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
  const doesArticleExist = checkArticleExists(article_id);
  const doesUserExist = checkUserExists(username);
  const query = db.query(
    `INSERT INTO comments (body, article_id, author) VALUES ($1, $2, $3) RETURNING *;`,
    [body, article_id, username]
  );
  return Promise.all([doesUserExist, query, doesArticleExist]).then(
    (results) => {
      return results[1].rows[0];
    }
  );
};

exports.removeCommentById = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [
      comment_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Comment not found" });
      }
      return rows[0];
    });
};

exports.updateCommentById = (comment_id, inc_votes = 0) => {
  return db
    .query(
      `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *;`,
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Comment not found" });
      }
      return rows[0];
    });
};
