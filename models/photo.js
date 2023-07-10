const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  comment: {
    type: String,
    minlength: 1,
    maxlength: 150,
  }
});

const photoSchema = new mongoose.Schema({
  label: {
    type:  String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  description: {
    type: String,
    minlength: 5,
    maxlength: 50,
  },
  link: {
    type: String,
    required: true,
  },
  owner: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'user',
  },
  views: {
    type: Number,
    default: 0,
  },
  comments: [commentSchema],
});

module.exports = mongoose.model('photo', photoSchema);