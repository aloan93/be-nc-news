const express = require("express");
const { apiRouter } = require("./routes/api-router");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(cors());

app.use("/api", apiRouter);

// custom errors
app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ message: err.message });
  }
  next(err);
});

// psql errors
app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ message: "Invalid Data Type" });
  }
});

// failsafe (500)
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Internal Server Error");
});

module.exports = app;
