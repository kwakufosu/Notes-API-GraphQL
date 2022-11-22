const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const auth = async (req,  next) => {
  try {
    const token = req.header['Authorization'].split('')[1];
    const decoded = await jwt.verify(token, process.env.SECRET);

    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      throw new Error('Please authenticate');
    }
    req.token = token;
    req.user = user;
  } catch (e) {
    throw new Error('Please authenticate');
  }
};

module.exports = auth;
