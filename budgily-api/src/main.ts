import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { Resolvers, root } from '@codedoc1/budgily-data';
import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import { getMovements } from './movements/movements';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import schemaFileName from '../../budgily-data/schema/budgily.graphql'; // using the esbuild file loader the file will be copied to the output and the schemaFileName will be the new file name (it comes with a hash)
import { categorize, getCategoriesByMovement } from './categories/categories';
const schema = readFileSync(join(__dirname, schemaFileName)).toString();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const allowCORS = process.env.CORS ?? '';
const app = express();

const server = new ApolloServer({
  typeDefs: schema.toString(),
  resolvers: <Resolvers>{
    // Movement: {
    //   categories: getCategoriesByMovement()
    // },
    Query: {
      ...root.Query,
      movements: getMovements(),
      categories: getCategoriesByMovement(),
    },
    Mutation: {
      categorize: categorize()
    }
  },
});

// startStandaloneServer(server, {listen: {port}})

// Note you must call `server.start()` on the `ApolloServer`
// instance before passing the instance to `expressMiddleware`
server.start().then(() => {
  const originsAllowed = ['http://localhost:4200', 'http://localhost:4300', 'http://localhost:8888', allowCORS];
  console.log('allowed CORS from ', originsAllowed)
  // Specify the path where we'd like to mount our server
  app.use('/graphql', cors<cors.CorsRequest>({ origin: originsAllowed }), json(), expressMiddleware(server));

  app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
  });
});

// const app = express();

// // start the GraphQl Server
// app.use('/graphql', createHandler({ rootValue: root, schema: buildSchema(schema) }));

// // start the playground server (should disable for prod)
// app.get('/playground', playground({ endpoint: '/graphql' }));

// // todo: HTTPS!
// app.listen(port, host, () => {
//   console.log(`[ ready ] http://${host}:${port}`);
// });
