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
  test("should return the specific article that matches the passed article_id, complete with article_id, votes and created_at properties", () => {
    return request(app)
      .get("/api/articles/3")
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 3,
          votes: 0,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "icellusedkars",
          body: "some gifs",
          created_at: "2020-11-03T09:12:00.000Z",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("should return the article with the property of comment_count that represents the total comments associated to the article", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body }) => {
        expect(body.article.comment_count).toBe("2");
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
  // test('should return a 400 status code and "Invalid Order" when passed an order that is neither "asc" or "desc"', () => {
  //   return request(app)
  //     .get("/api/articles?order=down")
  //     .expect(400)
  //     .then(({ body }) => {
  //       expect(body.message).toBe("Invalid Order");
  //     });
  // });
  // test('should return a 200 status code and "No Matching Articles Found" when passed a valid query that returns no result rows', () => {
  //   return request(app)
  //     .get("/api/articles?author=videogames")
  //     .expect(200)
  //     .then(({ body }) => {
  //       expect(body.message).toBe("No Matching Articles Found");
  //     });
  // });
  // test("should return a 200 status code and an array of articles matching a valid query", () => {
  //   return request(app)
  //     .get("/api/articles?topic=cats")
  //     .expect(200)
  //     .then(({ body }) => {
  //       expect(body.articles).toEqual([
  //         {
  //           article_id: 5,
  //           author: "rogersop",
  //           title: "UNCOVERED: catspiracy to bring down democracy",
  //           topic: "cats",
  //           created_at: "2020-08-03T13:14:00.000Z",
  //           votes: 0,
  //           article_img_url:
  //             "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
  //           comment_count: "2",
  //         },
  //       ]);
  //     });
  // });
  // test("should return a 200 status code and matching articles when provided multiple queries", () => {
  //   return request(app)
  //     .get("/api/articles?topic=mitch&author=butter_bridge")
  //     .expect(200)
  //     .then(({ body }) => {
  //       expect(body.articles).toEqual([
  //         {
  //           article_id: 12,
  //           author: "butter_bridge",
  //           title: "Moustache",
  //           topic: "mitch",
  //           created_at: "2020-10-11T11:24:00.000Z",
  //           votes: 0,
  //           article_img_url:
  //             "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
  //           comment_count: "0",
  //         },
  //         {
  //           article_id: 13,
  //           author: "butter_bridge",
  //           title: "Another article about Mitch",
  //           topic: "mitch",
  //           created_at: "2020-10-11T11:24:00.000Z",
  //           votes: 0,
  //           article_img_url:
  //             "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
  //           comment_count: "0",
  //         },
  //         {
  //           article_id: 1,
  //           author: "butter_bridge",
  //           title: "Living in the shadow of a great man",
  //           topic: "mitch",
  //           created_at: "2020-07-09T20:11:00.000Z",
  //           votes: 100,
  //           article_img_url:
  //             "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
  //           comment_count: "11",
  //         },
  //         {
  //           article_id: 9,
  //           author: "butter_bridge",
  //           title: "They're not exactly dogs, are they?",
  //           topic: "mitch",
  //           created_at: "2020-06-06T09:10:00.000Z",
  //           votes: 0,
  //           article_img_url:
  //             "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
  //           comment_count: "2",
  //         },
  //       ]);
  //     });
  // });
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

describe("POST /api/articles/:article_id/comments", () => {
  test("should return a 201 status code and the posted comment as an object with all relevant keys", () => {
    const newComment = { username: "rogersop", body: "I like trains" };
    const expectedComment = {
      comment_id: 19,
      body: "I like trains",
      article_id: 2,
      author: "rogersop",
      votes: 0,
    };

    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject(expectedComment);
        expect(typeof body.comment.created_at).toBe("string");
      });
  });
  test("should return a 404 status code and 'User not found' when passed a user not currently in the database", () => {
    const newComment = { username: "Big_Geoff", body: "aaaaaaaaaa" };

    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("User not found");
      });
  });
  test("should return a 400 code and 'Invalid Data Type' when passed a an invalid article_id", () => {
    const newComment = { username: "rogersop", body: "I like trains" };

    return request(app)
      .post("/api/articles/six/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid Data Type");
      });
  });
  test("should return a 400 code and 'Missing mandatory property' when failing to supply any required property", () => {
    const newComment = { username: "rogersop" };

    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Missing mandatory property");
      });
  });
  test("should return a 404 code and 'Not Found' when failing to pass an article_id", () => {
    const newComment = { username: "rogersop", body: "I like trains" };

    return request(app)
      .post("/api/articles/comments")
      .send(newComment)
      .expect(404)
      .then(({ res }) => {
        expect(res.statusMessage).toBe("Not Found");
      });
  });
  test("should return a 404 code and 'Article not found' when passing a valid article_id that does not exist", () => {
    const newComment = { username: "rogersop", body: "I like trains" };

    return request(app)
      .post("/api/articles/99/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });
});
