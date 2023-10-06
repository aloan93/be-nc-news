const db = require("../db/connection");
const { checkUserExists } = require("./users.models");
const { checkTopicExists } = require("./topics.models");

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `SELECT articles.article_id, articles.author, articles.body, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count 
    FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article Not Found" });
      } else {
        return rows[0];
      }
    });
};

exports.fetchArticles = (
  author,
  topic,
  sort_by = "created_at",
  order = "DESC"
) => {
  const validSortBys = {
    article_id: "article_id",
    created_at: "created_at",
    votes: "votes",
    comment_count: "comment_count",
    title: "title",
  };

  if (!validSortBys[sort_by]) {
    return Promise.reject({ status: 400, message: "Invalid sort_by" });
  }

  let query = `SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count 
  FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id `;

  const queryParams = [];
  if (author && topic) {
    queryParams.push(author);
    queryParams.push(topic);
    query += ` WHERE articles.author = $1 AND articles.topic = $2`;
  } else if (author) {
    queryParams.push(author);
    query += ` WHERE articles.author = $1`;
  } else if (topic) {
    queryParams.push(topic);
    query += ` WHERE articles.topic = $1`;
  }

  query += ` GROUP BY articles.article_id`;

  query += ` ORDER BY ${validSortBys[sort_by]} ${order}`;

  if (order.toUpperCase() === "DESC" || order.toUpperCase() === "ASC") {
    return db.query(query, queryParams).then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 200,
          message: "No Matching Articles Found",
        });
      }
      return result.rows;
    });
  } else {
    return Promise.reject({ status: 400, message: "Invalid Order" });
  }
};

exports.checkArticleExists = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article not found" });
      }
    });
};

exports.updateArticleById = (article_id, inc_votes = 0) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article not found" });
      }
      return rows[0];
    });
};

exports.createArticle = (
  author,
  title,
  body,
  topic,
  article_img_url = "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
) => {
  if (!author || !title || !body || !topic) {
    return Promise.reject({
      status: 400,
      message: "Missing mandatory property",
    });
  }
  const doesUserExist = checkUserExists(author);
  const doesTopicExist = checkTopicExists(topic);
  const query = db
    .query(
      `INSERT INTO articles (author, title, body, topic, article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [author, title, body, topic, article_img_url]
    )
    .then(({ rows }) => {
      const { article_id } = rows[0];
      return db.query(
        `SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.body, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count 
      FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id;`,
        [article_id]
      );
    });
  return Promise.all([doesUserExist, query, doesTopicExist]).then((results) => {
    return results[1].rows[0];
  });
};
