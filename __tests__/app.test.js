const request = require("supertest");
const testData = require("../db/data/test-data");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const endPointsJson = require("../endpoints.json");
require("jest-sorted");

beforeEach(() => {
  return seed(testData);
});
afterAll(() => db.end());

describe("GET /api/topics", () => {
  test("should return a 200 status code", () => {
    return request(app).get("/api/topics").expect(200);
  });
  test("should return an array of all topics, each with a 'slug' and 'description' property", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.topics)).toBe(true);
        expect(body.topics.length).toBe(3);
        body.topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
  test("should return a 404 status code and 'Not Found' when passed an incorrectly spelled api request", () => {
    return request(app)
      .get("/api/topisc")
      .expect(404)
      .then(({ res }) => {
        expect(res.statusMessage).toBe("Not Found");
      });
  });
});

describe("GET /api", () => {
  test("should return a 200 status code", () => {
    return request(app).get("/api").expect(200);
  });
  test("should return an accurate JSON object that reflects the contents of the endpoints.json file", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(typeof JSON.stringify(body.endPoints)).toBe("string");
        expect(typeof body.endPoints).toBe("object");
        expect(body.endPoints).toEqual(endPointsJson);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("should return a 200 status code", () => {
    return request(app).get("/api/articles/2").expect(200);
  });
  test("should return the specific article that matches the passed article_id, complete with article_id, votes and a user friendly created_at", () => {
    return request(app)
      .get("/api/articles/3")
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 3,
          votes: 0,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "icellusedkars",
          body: "some gifs",
          created_at: "Tue Nov 03 2020 09:12:00 GMT+0000 (Greenwich Mean Time)",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("should return a 404 status code and 'Article Not Found' when passed an article_id that does not exist", () => {
    return request(app)
      .get("/api/articles/99")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article Not Found");
      });
  });
  test("should return a 400 status code and 'Invalid Data Type' when passed an article_id that is not a number", () => {
    return request(app)
      .get("/api/articles/six")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid Data Type");
      });
  });
});

describe("GET /api/articles", () => {
  test("should return a 200 status code and an array of all article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBe(13);
        body.articles.forEach((article) => {
          expect(typeof article).toBe("object");
        });
      });
  });
  test("should return each article with keys of author, title, article_id, topic, created_at, votes, article_img_url, and comment_count", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
        });
      });
  });
  test("should return each article without a body key", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).not.toHaveProperty("body");
        });
      });
  });
  test("should return the articles sorted by date in descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("should return the articles sorted by any valid property when supplied as a query", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("title", {
          descending: true,
        });
      });
  });
  test("should return the articles sorted in ascending order if specified", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("title", {
          descending: false,
        });
      });
  });
  test("should return all articles of a specific topic when queried", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(12);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("should return all articles of a specific author when queried", () => {
    return request(app)
      .get("/api/articles?author=rogersop")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(3);
        body.articles.forEach((article) => {
          expect(article.author).toBe("rogersop");
        });
      });
  });
  test('should return a 200 status code and "No Matching Articles Found" when passed a valid query that returns no result rows', () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        expect(body.message).toBe("No Matching Articles Found");
      });
  });
  test("should return all matching articles when provided multiple queries", () => {
    return request(app)
      .get("/api/articles?topic=mitch&author=butter_bridge")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toEqual(4);
        body.articles.forEach((article) => {
          expect(article.author).toBe("butter_bridge");
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("should return a 400 status code when passed an invalid sort_by", () => {
    return request(app)
      .get("/api/articles?sort_by=username")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid sort_by");
      });
  });
  test('should return a 400 status code and "Invalid Order" when passed an order that is neither "asc" or "desc"', () => {
    return request(app)
      .get("/api/articles?order=down")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid Order");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("should return a 200 code with an array of all comment objects associated to the article passed, along with all relevent keys", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
        expect(body.comments.length).toBe(11);
        body.comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author");
          expect(comment).toHaveProperty("body");
          expect(comment).toHaveProperty("article_id");
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(typeof comment.article_id).toBe("number");
        });
      });
  });
  test("should return the array of comments ordered by post date descending", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("should return a 200 code and an empty array when passed a an article_id that exists, but has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
  test("should return a 404 code and 'Article not found' when passed a an article_id does not exist", () => {
    return request(app)
      .get("/api/articles/88/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });
  test("should return a 400 code and 'Invalid Data Type' when passed a an invalid article_id", () => {
    return request(app)
      .get("/api/articles/six/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid Data Type");
      });
  });
});
