/*
npm i celebrate
*/

const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  updateUser,
  getCurrentUser,
  getAllUsers,
  activateUser,
} = require('../controllers/users');
const { regex } = require('../constants/constants');

router.get('/users', getAllUsers);
router.get('/users/me', getCurrentUser);
router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(20),
    avatar: Joi.string().required().regex(regex),
  })
}), updateUser);
router.patch('/users', celebrate({
  body: Joi.object().keys({
    userId: Joi.string().required(),
    userRole: Joi.string().required(),
    userActive: Joi.boolean().required(),
  })
}), activateUser);

module.exports = router;