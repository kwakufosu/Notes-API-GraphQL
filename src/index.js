const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer');
const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { json } = require('body-parser');
const resolvers = require('./resolvers/resolvers');
const auth = require('./middleware/auth');

const typeDefs = fs.readFileSync(
  path.join(__dirname, './schema/schema.graphql'),
  { encoding: 'utf-8' }
);
const User = require('./models/user');

require('./db/mongoose');

const app = express();
const httpServer = http.createServer(app);

const startServer = async () => {
  const app = express();

  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,

    resolvers,

    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/graphql',

    cors(),
    json(),

    expressMiddleware(server, {
      context: async ({ req, res }) => {
        // Get the user token from the headers.

        const token = req.headers.authorization || '';
        // Try to retrieve a user with the token
        if (!token) {
          return;
        }

        return { token };
      },
    })
  );

  await new Promise((resolve) => httpServer.listen({ port: 5000 }, resolve));

  console.log(`🚀 Server ready at http://localhost:5000/graphql`);
};

startServer();
