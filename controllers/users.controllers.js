const { fetchUsers } = require("../models/users.models");

exports.getUsers = (req, res, next) => {
  return fetchUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};
