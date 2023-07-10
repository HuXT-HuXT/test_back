/*
npm i bcrypt
npm i jsonwebtoken
*/

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

/* import default error types */
const Conflict = require('../errors/Conflict');
const InputError = require('../errors/InputError');
const NotFound = require('../errors/NotFound');
const Unauthorized = require('../errors/Unauthorized');

/* methods: createUser, getCurrentUser, updateUser, getAllUsers, login */

const createUser = (req, res, next) => {
  const {
    name, email, password, avatar
  } = req.body;

  const role = 'user';
  const active = false;

  bcrypt.hash(password, 10)
    .then((hashPassword) => {
      User.create({
        name, email, password: hashPassword, role, active, avatar,
      })
        .then((user) => {
          const { _id } = user;
          res.send({
            name, email, role, active, avatar,
          });
        })
        .catch((err) => {
          if (err.code === 11000) {
            console.log('error in createUser: Conflict');
            next(new Conflict('Email is already used'));
          } else if (err.name === 'ValidationError') {
            console.log('error in createUser: InputError');
            next(new InputError('Incorrect data'));
          } else {
            console.log('error in createUser:', err);
            next(err);
          }
        });
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        console.log('error in getCurrentUser');
        next(new NotFound(`User with id with ${req.user._id} not found.`));
      }
      res.send({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        active: user.active,
      });
    })
    .catch(next);
};

const getAllUsers = (req, res, next) => {
  const role = req.user.role;

  if (role !== 'admin') {
    next(new Unauthorized('Insufficient rights'));
    return
  }

  User.find({})
    .then((users) => {
      res.send({data: users});
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .orFail(() => {
      next(new NotFound(`User with id with ${req.user._id} not found.`));
    })
    .then((user) => {
      res.send({
        name: user.name, avatar: user.avatar,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError('Incorrect data'));
      } else {
        next(err);
      }
    });
};

const activateUser = (req, res, next) => {
  const role = req.user.role;
  const { userId, userRole, userActive } = req.body;

  if (role !== 'admin') {
    next(new Unauthorized('Insufficient rights'));
    return
  }

  User.findByIdAndUpdate(
    userId,
    { role: userRole, active: userActive },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .orFail(() => {
      next(new NotFound(`User with id with ${userId} not found.`));
    })
    .then((user) => {
      res.send({
        userRole: user.role, userActive: user.active,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError('Переданы некорректные данные.'));
      } else {
        next(err);
      }
    })
}

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Unauthorized('Wrong email or password'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Unauthorized('Wrong email or password'));
          }
          const token = jwt.sign({ _id: user._id, role: user.role }, 'accessTokenSecret');
          res.send({ token });
        });
    })
    .catch(next);
};

module.exports = {
  createUser,
  getCurrentUser,
  getAllUsers,
  updateUser,
  activateUser,
  login,
}