import { Types } from 'mongoose';
import User from '../models/user';

import Note from '../models/note';
import auth from '../middleware/auth';
import bcrypt from 'bcrypt';

interface Input {
  email: string;
  password: string;
}

interface userFace {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
}

interface userTok {
  token: string;
}

interface noteInput {
  note: String;
}

const resolvers = {
  Query: {
    greeting: () => 'Hello world',
    login: async function (_: string, { input }: { input: Input }) {
      const { email, password } = input;

      try {
        const user = await User.login(email, password);
        const token = await user.generateAuthToken();

        return { user, token };
      } catch (e) {
        throw new Error('Invalid credentials');
      }
    },
    getCurrentUserDetails: async function (
      root: any,
      _: any,
      { token }: { token: string }
    ) {
      const { user } = await auth(token);
      return user;
    },

    fetchNotesByAUser: async function (
      root: any,
      _: object,
      { token }: { token: string }
    ) {
      const { user } = await auth(token);

      const notes = await Note.find({ owner_id: user._id });
      if (!notes) {
        return 'No notes found';
      }
      return notes;
    },

    fetchUserNoteByID: async function (
      root: any,
      { id }: { id: string },
      { token }: { token: string }
    ) {
      const { user } = await auth(token);

      const note = await Note.findOne({ _id: id, owner_id: user.id });

      if (!note) {
        return 'No note found';
      }
      return note;
    },
  },

  Mutation: {
    createUser: async function (_: any, { input }: { input: userFace }) {
      try {
        const user = new User(input);

        const token = await user.generateAuthToken();

        await user.save();

        return { user, token };
      } catch (e) {
        console.log(e);
        throw new Error('Unsucccessful');
      }
    },

    updateCurrentUser: async function (
      _: any,
      { input }: { input: userFace },
      { token }: { token: string }
    ) {
      const { user } = await auth(token);
      const userID = user._id.toString();

      if (input.password) {
        input.password = await bcrypt.hash(input.password, 8);
      }
      if (!user && !(userID === input._id.toString())) {
        return;
      }
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { ...input },
        { new: true, runValidators: true }
      );

      await updatedUser?.save();

      return updatedUser;
    },

    logoutCurrentUser: async function (
      _: any,
      { _id }: { _id: string },
      { token }: { token: string }
    ) {
      const { user, tokenOnly } = await auth(token);

      if (!(user._id.toString() === _id)) {
        return;
      }

      user.tokens = user.tokens.filter((userToken: userTok) => {
        return userToken.token !== tokenOnly;
      });

      await user.save();

      return user;
    },

    logoutAll: async function (
      _: any,
      { _id }: { _id: string },
      { token }: { token: string }
    ) {
      const { user } = await auth(token);

      if (!(user._id.toString() === _id)) {
        return;
      }

      user.tokens = [];

      await user.save();
      return user;
    },

    deleteCurrentUser: async function (
      _: any,
      { _id }: { _id: string },
      { token }: { token: string }
    ) {
      const { user } = await auth(token);
      const deletedUser = user;
      if (!(user._id.toString() === _id)) {
        return;
      }
    
      await user.remove();

      return deletedUser;
    },

    createNote: async function (
      _: any,
      { input }: { input: noteInput },
      { token }: { token: string }
    ) {
      const { user } = await auth(token);

      const note = new Note({
        ...input,
        owner_id: user._id,
      });

      await note.save();
      return note;
    },

    deleteUserNoteByID: async function (
      _: any,
      { _id }: { _id: string },
      { token }: { token: string }
    ) {
      const { user } = await auth(token);

      const deletedNote = await Note.findOneAndDelete({
        _id,
        owner_id: user._id,
      });

      if (!deletedNote) {
        return 'No note found. Hence nothing was deleted';
      }

      return deletedNote;
    },

    deleteAllNotesByUser: async function (
      _: any,
      input: any,
      { token }: { token: string }
    ) {
      const { user } = await auth(token);
      let deletedNotes = await Note.find({ owner_id: user._id });
      await Note.deleteMany({ owner_id: user._id });
      if (!deletedNotes) {
        return 'No notes found. Hence nothing was deleted';
      }
      return deletedNotes;
    },

    updateNote: async function (
      _: any,
      { _id, input }: { _id: string; input: string },
      { token }: { token: string }
    ) {
      const { user } = await auth(token);
      const updatedNote = await Note.findOneAndUpdate(
        { owner_id: user._id, _id: _id },
        { note: input },
        { new: true, runValidators: true }
      );

      await updatedNote?.save();
      return updatedNote;
    },
  },
};

export default resolvers;
