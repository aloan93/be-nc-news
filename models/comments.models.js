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
