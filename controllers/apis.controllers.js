const { readFile } = require("fs/promises");

exports.getApis = (req, res, next) => {
  return readFile(`${__dirname}/../endpoints.json`, "UTF-8")
    .then((result) => {
      res.status(200).send({ endPoints: JSON.parse(result) });
    })
    .catch((err) => {
      next(err);
    });
};
