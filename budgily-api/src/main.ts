
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { root } from '@codedoc1/budgily-data';
import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import { getDskMovements } from './dsk/dsk-movements';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import schemaFileName from '../../budgily-data/schema/budgily.graphql'; // using the esbuild file loader the file will be copied to the output and the schemaFileName will be the new file name (it comes with a hash)
const schema = readFileSync(join(__dirname, schemaFileName)).toString();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

const server = new ApolloServer({
  typeDefs: schema.toString(),
  // schema: schema,
  resolvers: {
    Query: {
      ...root.Query,
      movements: getDskMovements
    }
  },
});

// startStandaloneServer(server, {listen: {port}})

// Note you must call `server.start()` on the `ApolloServer`
// instance before passing the instance to `expressMiddleware`
server.start()
.then(() => {
  // Specify the path where we'd like to mount our server
  app.use('/graphql', cors<cors.CorsRequest>(), json(), expressMiddleware(server));

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
