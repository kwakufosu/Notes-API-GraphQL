import mongoose from 'mongoose';
require('dotenv').config({ path: __dirname + '../../.env' });

if (typeof process.env.MONGO_URL === 'undefined') {
  throw new Error('MONGOURL is undefined');
}

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('connected to db'))
  .catch((e) => console.log(e));
