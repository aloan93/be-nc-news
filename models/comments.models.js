const db = require("../db/connection");
const { checkArticleExists } = require("./articles.models");

exports.fetchCommentsByArticleId = (article_id) => {
  const doesExist = checkArticleExists(article_id);
  const query = db.query(
    `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
    [article_id]
  );
  return Promise.all([doesExist, query]).then((results) => {
    if (results[1].rows.length === 0) {
      return Promise.reject({
        status: 200,
        message: "No comments currently on this article",
      });
    } else {
      return results[1].rows;
    }
  });
};
