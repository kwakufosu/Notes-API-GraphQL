const User = require('../models/user');
const Note = require('../models/note');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const resolvers = {
  Query: {
    greeting: () => 'Hello world',
    login: async function (_, { input }, context) {
      const { email, password } = input;

      try {
        const user = await User.login(email, password);
        const token = await user.generateAuthToken();

        return { user, token };
      } catch (e) {
        throw new Error('Invalid credentials');
      }
    },
    getCurrentUserDetails: async function (root, _, { token }) {
      return ({ user } = await auth(token));
    },

    fetchNotesByAUser: async function (root, _, { token }) {
      const { user } = await auth(token);

      const notes = await Note.find({ owner_id: user._id });
      if (!notes) {
        return 'No notes found';
      }
      return notes;
    },

    fetchUserNoteByID: async function (root, { id }, { token }) {
      const { user } = await auth(token);

      const note = await Note.findOne({ _id: id, owner_id: user.id });
      return note;
    },
  },

  Mutation: {
    createUser: async function (_, { input }) {
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

    updateCurrentUser: async function (_, { input }, { token }) {
      const { user } = await auth(token);
      const userID = user._id.toString();

      if (input.password) {
        input.password = await bcrypt.hash(input.password, 8);
      }
      if (!user && !(userID === input._id)) {
        return;
      }
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { ...input },
        { new: true, runValidators: true }
      );

      await updatedUser.save();

      return updatedUser;
    },

    logoutCurrentUser: async function (_, { _id }, { token }) {
      const { user, tokenOnly } = await auth(token);

      if (!user && !(user._id.toString() === _id)) {
        return;
      }

      user.tokens = user.tokens.filter((userToken) => {
        return userToken.token !== tokenOnly;
      });

      await user.save();

      return user;
    },

    logoutAll: async function (_, { _id }, { token }) {
      const { user } = await auth(token);

      if (!user && !(user._id.toString() === _id)) {
        return;
      }

      user.tokens = [];

      await user.save();
      return user;
    },

    deleteCurrentUser: async function (_, { _id }, { token }) {
      const { user } = await auth(token);
      const deletedUser = user;
      if (!(user._id.toString() === _id)) {
        return;
      }

      user.remove();

      return deletedUser;
    },

    createNote: async function (_, { input }, { token }) {
      const { user } = await auth(token);

      const note = new Note({
        ...input,
        owner_id: user._id,
      });

      await note.save();
      return note;
    },
  },
};

module.exports = resolvers;
