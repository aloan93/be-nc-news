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

exports.fetchArticles = () =>
  // author,
  // topic,
  // sort_by = "created_at",
  // order = "DESC"
  {
    // const validSortBys = {
    //   article_id: "article_id",
    //   created_at: "created_at",
    //   votes: "votes",
    //   comment_count: "comment_count",
    //   title: "title",
    // };

    let query = `SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count 
  FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id `;

    const queryParams = [];
    // if (author && topic) {
    //   queryParams.push(author);
    //   queryParams.push(topic);
    //   query += ` WHERE articles.author = $1 AND articles.topic = $2`;
    // } else if (author) {
    //   queryParams.push(author);
    //   query += ` WHERE articles.author = $1`;
    // } else if (topic) {
    //   queryParams.push(topic);
    //   query += ` WHERE articles.topic = $1`;
    // }

    query += ` GROUP BY articles.article_id ORDER BY created_at DESC`; // THIS WILL NEED REFACTORED!! see just bellow

    // query += ` ORDER BY ${validSortBys[sort_by]} ${order}`;

    // if (order === "DESC" || order === "ASC") {
    return db.query(query, queryParams).then((result) => {
      // if (result.rows.length === 0) {
      //   return Promise.reject({
      //     status: 200,
      //     message: "No Matching Articles Found",
      //   });
      // }
      return result.rows;
    });
  };
// else {
//   return Promise.reject({ status: 400, message: "Invalid Order" });
// }

exports.checkArticleExists = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article not found" });
      }
    });
};
