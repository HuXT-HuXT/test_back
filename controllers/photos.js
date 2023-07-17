const Photo = require('../models/photo');

/* import default error types */
const Forbidden = require('../errors/Forbidden');
const InputError = require('../errors/InputError');
const NotFound = require('../errors/NotFound');
const Unauthorized = require('../errors/Unauthorized');

/* methods: createPhoto, getPhoto, getAllPhotos, updateInfo, updateViews, updateComment */
const addPhoto = (req, res, next) => {
  const userId = req.user._id;
  const {
    label,
    description,
  } = req.body;
  const link = req.file.path;

  Photo.create({
    label,
    description,
    link,
    owner: userId,
    })
     .then((photo) => {
      res.send({
        // _id: photo._id,
        // label: photo.label,
        // description: photo.description,
        // link: photo.link,
        // views: photo.views,
        photo
      });
     })
     .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError('Wrong data transferred.'));
      } else {
        next(err);
      }
     });
};

const getPhoto = (req, res, next) => {
  const { photoID } = req.params;
  const userId = req.user._id;

  Photo.findById(photoID)
    .orFail(() => {
      next(new NotFound(`Photo with ${photoID} was not found.`));
    })
    .then((photo) => {
      res.send({ data: photo });
    })
    .catch(next);
};

const getAllPhotos = (req, res, next) => {
  Photo.find({})
    .then((photos) => {
      res.send({ data: photos });
    })
    .catch(next);
};

const updateDescription = (req, res, next) => {
  const { photoID } = req.params;
  const userId = req.user._id;
  const { description } = req.body;

  Photo.findById(photoID)
    .then((photo) => {
      if (!photo) {
        return Promise.reject(new NotFound(`Photo with id: ${photoID} not found.`));
      }
      if (photo.owner.toString() !== userId) {
        return Promise.reject(new Forbidden('Not allowed.'))
      }
      return Photo.findByIdAndUpdate(
        photo,
        { description },
        {
          new: true,
          runValidators: true,
          upsert: false,
        },
      )
        .then((updatedPhoto) => {
          return res.send(updatedPhoto);
        });
    })
    .catch(next);
};

const addComment = (req, res, next) => {
  const { photoID } = req.params;
  const userId = req.user._id;
  const comment = req.body.comment;

  Photo.findByIdAndUpdate(
    { _id: photoID},
    {
      $push: {
        comments: {
          owner: userId,
          comment,
        }
      }
    },
    {
      new: true,
      runValidators: true,
      upsert: false,
    }
  )
    .orFail(() => {
      next(new NotFound(`Photo with ${photoID} was not found.`));
    })
    .then((photo) => {
      res.send(photo)
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError('Wrong data transferred.'));
      } else {
        next(err);
      }
    })
};

const updateComment = (req, res, next) => {
  const { photoID } = req.params;
  const userId = req.user._id;
  const commentId = req.body._id;
  const newComment = req.body.comment;

  Photo.findOne({
    _id: photoID,
  })
    .orFail(() => {
      next (new NotFound('Not found'));
    })
    .then((photo) => {
      if (!((presenceOfComment = photo.comments.filter(comment => comment._id.toString() === commentId)).length)) {
        return Promise.reject(new NotFound(`Comment with ${commentId} not found`));
      }
      const commentToUpdate = photo.comments.filter(comment => comment.owner.toString() === userId && comment._id.toString() === commentId);
      if (!commentToUpdate.length) {
        return Promise.reject(new Forbidden('Not allowed!'));
      }
      return Photo.findOneAndUpdate({
        'comments._id': commentId,
      },
      {
        $set: {'comments.$.comment': newComment}
      },
      {
        new: true,
        runValidators: true,
        upsert: false,
      },
      )
        .then((photo) => {
          const filteredComments = photo.comments.map(comment => {
            return {
              _id: comment._id,
              comment: comment.comment,
              own: (comment.owner.toString() === userId) ? true : false,
            };
          });
          return res.send(filteredComments);
        })
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new InputError('Wrong data transferred.'));
      } else {
        next(err);
      }
    });
};

const getComments = (req, res, next) => {
  const { photoID } = req.params;
  console.log(photoID);
  Photo.findById(photoID)
    .orFail(() => {
      next(new NotFound(`Comment with ${commentId} not found`));
    })
    .then((photo) => {
      res.send(photo.comments);
    })
    .catch(next);
}

const removeComment = (req, res, next) => {
  const userRole = req.user.role;
  const commentId = req.body.commentId;
  const { photoID } = req.params;

  if (userRole !== 'admin') {
    next(new Forbidden('Insufficient rights.'))
  }
  Photo.findByIdAndUpdate(
    photoID,
    {
      $pull: {'comments': {_id: commentId}}
    },
    {
      new: true,
      runValidators: true,
      upsert: false,
    }
  )
    .then((photo) => {
      res.send((photo))
    })
    .catch((next));
}

module.exports = {
  addPhoto,
  getPhoto,
  getAllPhotos,
  updateDescription,
  addComment,
  updateComment,
  getComments,
  removeComment,
}


