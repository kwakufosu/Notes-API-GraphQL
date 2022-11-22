const User = require('../models/user');

const resolvers = {
  Query: {
    greeting: () => 'Hello world',
    login: async function (_, { input }, { req }) {
      const { email, password } = input;

      try {
        const user = await User.login(email, password);
        const token = await user.generateAuthToken();

        console.log(UserDetails);
        //console.log(user);
        return { user, token };
      } catch (e) {
        throw new Error('Invalid credentials');
      }
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
