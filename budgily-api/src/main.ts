import express from 'express';

import { createHandler } from 'graphql-http/lib/use/express';
import { root, schema } from '@codedoc1/budgily-data';
import playground from 'graphql-playground-middleware-express';
import { buildSchema } from 'graphql';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// start the GraphQl Server
app.use('/graphql', createHandler({ rootValue: root, schema: buildSchema(schema) }));

// start the playground server (should disable for prod)
app.get('/playground', playground({ endpoint: '/graphql' }));

// todo: HTTPS!
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
