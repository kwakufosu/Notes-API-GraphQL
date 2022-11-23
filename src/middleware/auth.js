const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const auth = async (token) => {
  try {
    const tokenOnly = token.split(' ')[1];

    const decoded = await jwt.verify(
      tokenOnly.replace(/\"/g, ''),
      process.env.SECRET
    );

    const user = await User.findOne({
      _id: decoded._id,
    });

    if (!user) {
      throw new Error('Please authenticate');
    }

    return user;
  } catch (e) {
    throw new Error('Please authenticate');
  }
};

module.exports = auth;
