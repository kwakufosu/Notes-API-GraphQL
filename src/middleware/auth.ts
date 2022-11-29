import * as jwt from 'jsonwebtoken';
import User from '../models/user';
require('dotenv').config({ path: __dirname + '../../.env' });

const auth = async (token: string) => {
  try {
    const tokenOnly = token.split(' ')[1].replace(/\"/g, '');

    if (typeof process.env.SECRET === 'undefined') {
      throw new Error('MONGOURL is undefined');
    }

    interface JwtPayload {
      _id: string;
    }
    const decoded = (await jwt.verify(
      tokenOnly,
      process.env.SECRET
    )) as JwtPayload;

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

export default auth;
