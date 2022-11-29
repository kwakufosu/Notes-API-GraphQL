import { HydratedDocument, Model, model, Schema, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import Note from './note';
require('dotenv').config({ path: __dirname + '../../.env' });

interface userTok {
  token: string;
}

interface userToks extends Array<userTok> {}

interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  tokens: userToks;
}

interface IUserMethods {
  generateAuthToken(): Promise<string>;
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
  login(
    email: string,
    password: string
  ): Promise<HydratedDocument<IUser, IUserMethods>>;
}
const schema = new Schema<IUser, UserModel, IUserMethods>(
  {
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
      validate(value: string) {
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
  },
  {
    timestamps: true,
  }
);

schema.methods.generateAuthToken = async function () {
  const user = this;

  if (typeof process.env.SECRET === 'undefined') {
    throw new Error('MONGOURL is undefined');
  }
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

schema.statics.login = async function (email: string, password: string) {
  const user = await this.findOne({ email });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return user;
};

schema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

schema.pre('remove', async function (this: IUser, next) {
  const user = this;

  await Note.deleteMany({ owner_id: user._id });

  next();
});

const User = model<IUser, UserModel>('User', schema);

export default User;
