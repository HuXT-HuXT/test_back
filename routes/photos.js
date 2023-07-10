const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  addPhoto,
  getPhoto,
  getAllPhotos,
  updateDescription,
  addComment,
  updateComment,
  getComments,
  removeComment,
} = require('../controllers/photos');


router.post('/upload', celebrate({
  body: Joi.object().keys({
    label: Joi.string().required().min(3).max(20),
    description: Joi.string().min(5).max(50),
  })
}), addPhoto);
router.get('/photos/:photoID', getPhoto);

router.get('/photos/', getAllPhotos);
router.patch('/photos/:photoID', celebrate({
  body: Joi.object().keys({
    description: Joi.string().min(5).max(150),
  })
}), updateDescription);
router.post('/photos/:photoID/comments', celebrate({
  body: Joi.object().keys({
    comment: Joi.string().required().min(1).max(150),
  })
}), addComment);
router.patch('/photos/:photoID/comments',  celebrate({
  body: Joi.object().keys({
    _id: Joi.string().required(),
    comment: Joi.string().required().min(1).max(150),
  })
}), updateComment);
router.get('/photos/:photoID/comments', getComments);
router.delete('/photos/:photoID/comments', celebrate({
  body: Joi.object().keys({
    commentId: Joi.string().required(),
  })
}), removeComment);

module.exports = router;