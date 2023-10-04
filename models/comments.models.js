const db = require("../db/connection");
const { checkArticleExists } = require("./articles.models");

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
