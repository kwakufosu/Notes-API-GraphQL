const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Note = require('./note');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password must not include "password"');
      } else if (value.length < 8) {
        throw new Error('Password must be at least 8 characters ');
      }
    },
  },

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = await jwt.sign(
    {
      _id: user._id.toString(),
    },
    process.env.SECRET
  );

  user.tokens = user.tokens.concat({ token });

  await user.save();
  return token;
};

userSchema.statics.login = async function (email, password) {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return user;
};

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.pre('remove', async function (next) {
  const user = this;
  console.log(user)
  await Note.deleteMany({ owner_id: user._id });

  next()
});

const User = mongoose.model('User', userSchema);
module.exports = User;
