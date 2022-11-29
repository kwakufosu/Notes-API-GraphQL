import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import fs from 'fs';
import path from 'path';
import express from 'express';
import http from 'http';

import { json } from 'body-parser';
import resolvers from './resolvers/resolvers';
import User from './models/user';

const typeDefs = fs.readFileSync(
  path.join(__dirname, './schema/schema.graphql'),
  { encoding: 'utf-8' }
);

require('./db/mongoose');

interface MyContext {
  token?: String;
}
const app = express();
const httpServer = http.createServer(app);

const startServer = async () => {
  const app = express();

  const httpServer = http.createServer(app);

  const server = new ApolloServer<MyContext>({
    typeDefs,

    resolvers,

    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/graphql',

    json(),

    expressMiddleware(server, {
      context: async ({ req }) => {
        return { token: req.headers.authorization };
      },
    })
  );

  await httpServer.listen({ port: 5000 });

  console.log(`🚀 Server ready at http://localhost:5000/graphql`);
};

startServer();
