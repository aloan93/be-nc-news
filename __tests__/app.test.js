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
  test("should return a 200 status code and an array of article objects and a 'total_count' equal to all articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.total_count).toBe(13);
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
        expect(body.total_count).toBe(12);
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
  test('should accept a "limit" query which limits the number of responses returned', () => {
    return request(app)
      .get("/api/articles?limit=3")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(3);
      });
  });
  test('should default "limit" to 10 if not passed as a query', () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
      });
  });
  test('should accept a "p" query which indicates which page of results to retrieve', () => {
    return request(app)
      .get("/api/articles?limit=3&p=3")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(3);
        expect(body.articles).toEqual([
          {
            article_id: 1,
            author: "butter_bridge",
            title: "Living in the shadow of a great man",
            topic: "mitch",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: "11",
          },
          {
            article_id: 9,
            author: "butter_bridge",
            title: "They're not exactly dogs, are they?",
            topic: "mitch",
            created_at: "2020-06-06T09:10:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: "2",
          },
          {
            article_id: 10,
            author: "rogersop",
            title: "Seven inspirational thought leaders from Manchester UK",
            topic: "mitch",
            created_at: "2020-05-14T04:15:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: "0",
          },
        ]);
      });
  });
  test('should default "p" to 1 if not passed as a query so to display first page', () => {
    return request(app)
      .get("/api/articles?limit=2")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toEqual([
          {
            article_id: 3,
            author: "icellusedkars",
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            created_at: "2020-11-03T09:12:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: "2",
          },
          {
            article_id: 6,
            author: "icellusedkars",
            title: "A",
            topic: "mitch",
            created_at: "2020-10-18T01:00:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: "1",
          },
        ]);
      });
  });
  test("should return a 400 code and 'Invalid limit/page data type' if passed a non-number for 'limit' or 'p'", () => {
    return request(app)
      .get("/api/articles?limit=2&p=three")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid limit/page query");
      });
  });
  test("should also return a 400 code and 'Invalid limit/page query' if 'limit' or 'p' is passed as a float, zero, or negative number", () => {
    return request(app)
      .get("/api/articles?limit=0")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toEqual("Invalid limit/page query");
      });
  });
});

describe.only("GET /api/articles/:article_id/comments", () => {
  test("should return a 200 code with an array of all comment objects associated to the article passed, along with all relevent keys", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=15")
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
  test("should accept a 'limit' query that limits the amount of responses returned", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=2")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(2);
      });
  });
  test("should default 'limit' to 10 if not passed as a query", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(10);
      });
  });
  test("should accept a 'p' query which indicates which page of results to retrieve", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=2&p=2")
      .expect(200)
      .then(({ body }) => {
        console.log(body.comments);
        expect(body.comments).toEqual([
          {
            comment_id: 18,
            body: "This morning, I showered for nine minutes.",
            article_id: 1,
            author: "butter_bridge",
            votes: 16,
            created_at: "2020-07-21T00:20:00.000Z",
          },
          {
            comment_id: 13,
            body: "Fruit pastilles",
            article_id: 1,
            author: "icellusedkars",
            votes: 0,
            created_at: "2020-06-15T10:25:00.000Z",
          },
        ]);
      });
  });
});

describe("GET /api/users", () => {
  test("should return a 200 code with an array of all user objects with 'username', 'name' and 'avatar_url' properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length).toBe(4);
        body.users.forEach((user) => {
          expect(user).toHaveProperty("username", expect.any(String));
          expect(user).toHaveProperty("name", expect.any(String));
          expect(user).toHaveProperty("avatar_url", expect.any(String));
        });
      });
  });
});

describe("GET /users/:username", () => {
  test("should return a 200 code and the request user object", () => {
    return request(app)
      .get("/api/users/icellusedkars")
      .expect(200)
      .then(({ body }) => {
        expect(body.user.username).toBe("icellusedkars");
        expect(body.user.name).toBe("sam");
        expect(body.user.avatar_url).toBe(
          "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4"
        );
      });
  });
  test("should return a 404 code and 'User not found' if passed a username that does not exist", () => {
    return request(app)
      .get("/api/users/big_geoff")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("User not found");
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

describe("POST /api/articles", () => {
  test("should return a 201 status code and the posted comment as an object with all relevant keys", () => {
    const newArticle = {
      author: "rogersop",
      title: "Ode to Books",
      body: "They're pretty canny like",
      topic: "paper",
      article_img_url: "smashing_pic",
    };
    const expectedArticle = {
      author: "rogersop",
      title: "Ode to Books",
      body: "They're pretty canny like",
      topic: "paper",
      article_img_url: "smashing_pic",
      article_id: 14,
      votes: 0,
      comment_count: "0",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject(expectedArticle);
        expect(typeof body.article.created_at).toBe("string");
      });
  });
  test("should return a 404 status code and 'User not found' when passed an 'author' who's not a user in the database", () => {
    const newArticle = {
      author: "big_geoff",
      title: "Ode to Books",
      body: "They're pretty canny like",
      topic: "paper",
      article_img_url: "smashing_pic",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("User not found");
      });
  });
  test("should return a 404 code and 'Topic not found' when passed an invalid 'topic'", () => {
    const newArticle = {
      author: "rogersop",
      title: "Ode to Books",
      body: "They're pretty canny like",
      topic: "books",
      article_img_url: "smashing_pic",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Topic not found");
      });
  });
  test("should return a 400 code and 'Missing mandatory property' when failing to supply any required property", () => {
    const newArticle = {
      author: "rogersop",
      title: "Ode to Books",
      body: "They're pretty canny like",
      article_img_url: "smashing_pic",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Missing mandatory property");
      });
  });
  test("should return a 201 code and article object with defaulted 'article_img_url' when not passed in the post request", () => {
    const newArticle = {
      author: "rogersop",
      title: "Ode to Books",
      body: "They're pretty canny like",
      topic: "paper",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article.article_img_url).toBe(
          "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
        );
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test('should return a 200 code and an article object with the "votes" property incremented by the "inc_votes" passed', () => {
    const expectedObj = {
      article_id: 3,
      title: "Eight pug gifs that remind me of mitch",
      topic: "mitch",
      author: "icellusedkars",
      body: "some gifs",
      votes: 5,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };

    return request(app)
      .patch("/api/articles/3")
      .send({ inc_votes: 5 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject(expectedObj);
        expect(typeof body.article.created_at).toBe("string");
      });
  });
  test('should also decrement the "votes" property when passed a negative "inc_votes" value', () => {
    const expectedObj = {
      article_id: 1,
      title: "Living in the shadow of a great man",
      votes: 50,
    };

    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -50 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject(expectedObj);
      });
  });
  test("should return a 200 code and unchanged article if passed an empty patch body", () => {
    const expectedObj = {
      article_id: 1,
      title: "Living in the shadow of a great man",
      votes: 100,
    };

    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject(expectedObj);
      });
  });
  test("should return a 404 code when passed an article_id that does not exist", () => {
    return request(app)
      .patch("/api/articles/99")
      .send({ inc_votes: -50 })
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });
  test("should return a 400 code when passed an invalid article_id", () => {
    return request(app)
      .patch("/api/articles/six")
      .send({ inc_votes: -50 })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid Data Type");
      });
  });
  test("should return a 400 code when passed an invalid inc_votes value", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "five" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid Data Type");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test('should return a 200 code and a comment object with the "votes" property incremented by the "inc_votes" passed', () => {
    const expectedObj = {
      comment_id: 2,
      body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
      article_id: 1,
      author: "butter_bridge",
      votes: 20,
    };

    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: 6 })
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject(expectedObj);
        expect(typeof body.comment.created_at).toBe("string");
      });
  });
  test('should also decrement the "votes" property when passed a negative "inc_votes" value', () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: -4 })
      .expect(200)
      .then(({ body }) => {
        expect(body.comment.votes).toBe(10);
      });
  });
  test("should return a 200 code and unchanged comment if passed an empty patch body", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({})
      .expect(200)
      .then(({ body }) => {
        expect(body.comment.votes).toBe(14);
      });
  });
  test("should return a 404 code when passed a comment_id that does not exist", () => {
    return request(app)
      .patch("/api/comments/50")
      .send({ inc_votes: -10 })
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Comment not found");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("should return a 204 code with no content when deletion is successful", () => {
    return request(app).delete("/api/comments/16").expect(204);
  });
  test("should return a 404 code with 'Comment not found' when the comment does not exist", () => {
    return request(app)
      .delete("/api/comments/99")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Comment not found");
      });
  });
  test("should return a 400 code and 'Invalid Data Type' when passed a an invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/six")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid Data Type");
      });
  });
});
