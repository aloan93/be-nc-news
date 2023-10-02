const db = require("../db/connection");

exports.fetchArticleById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
    .then((output) => {
      if (output.rows < 1) {
        return Promise.reject({ status: 404, message: "Article Not Found" });
      } else {
        const article = output.rows[0];
        article.created_at = article.created_at.toString();
        return article;
      }
    });
};
