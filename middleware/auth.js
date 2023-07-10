const jwt = require('jsonwebtoken');

const Unauthorized = require('../errors/Unauthorized');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next(new Unauthorized('Authorization is required'));

    return;
  }

  const token = authHeader.split(' ')[1];

  let payload;

  try {
    payload = jwt.verify(token, 'accessTokenSecret');
  } catch (err) {
    next(new Unauthorized('Authorization is required'));
  }

  req.user = payload;

  next();
};