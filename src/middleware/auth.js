const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const auth = async (token) => {
  try {
    const tokenOnly = token.split(' ')[1].replace(/\"/g, '');

    const decoded = await jwt.verify(tokenOnly, process.env.SECRET);

    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': tokenOnly,
    });

    if (!user) {
      throw new Error('Please authenticate');
    }

    return { user, tokenOnly };
  } catch (e) {
    throw new Error('Please authenticate');
  }
};

module.exports = auth;
