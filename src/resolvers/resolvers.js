const User = require('../models/user');
const auth = require('../middleware/auth');

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
      return await auth(token);
    },
  },

  Mutation: {
    createUser: async function (_, { input }) {
      try {
        const user = new User(input);

        const token = await user.generateAuthToken();
        await user.save();

        return {
          user,
          token,
        };
      } catch (e) {
        console.log(e);
        throw new Error('Unsucccessful');
      }
    },
  },
};

module.exports = resolvers;
