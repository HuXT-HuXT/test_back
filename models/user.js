const mongoose = require('mongoose');
const validator = require('validator');


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20,
  },
  avatar: {
    type: String,
    required: false,
    validate: {
      validator(URL) {
        return validator.isURL(URL);
      }
    }
  },
  role: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  }
});

module.exports = mongoose.model('user', userSchema);