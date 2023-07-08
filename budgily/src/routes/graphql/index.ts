import { ApolloServer, BaseContext, ContextFunction, HTTPGraphQLRequest, HeaderMap } from '@apollo/server';
import { ExpressContextFunctionArgument } from '@apollo/server/express4';
import { type RequestHandler } from '@builder.io/qwik-city';
import { Resolvers, root } from '@codedoc1/budgily-data';

import { getMovements } from '../../../../budgily-api/src/movements/movements';

import { readFileSync } from 'node:fs';

import { categorize, getCategoriesByMovement } from '../../../../budgily-api/src/categories/categories';

const schemaFileName = process.env.BUDGILY_SCHEMA_FILE_PATH ?? '';
if(typeof schemaFileName === 'string') {
  // no server starting and on requests
  // log it out
  // requests will not be handled
}
const schema = readFileSync(schemaFileName).toString();

const server = new ApolloServer({
  csrfPrevention: false,
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
      categorize: categorize(),
    },
  },
});
const start = server.start();

export const onRequest: RequestHandler = async ({
  parseBody,
  method,
  next,
  send,
  request,
  query,
  getWritableStream,
}) => {
  await start;

  // from expressMiddleware node_modules/@apollo/server/src/express4/index.ts
  server.assertStarted('expressMiddleware()');

  // This `any` is safe because the overload above shows that context can
  // only be left out if you're using BaseContext as your context, and {} is a
  // valid BaseContext.
  const defaultContext: ContextFunction<[ExpressContextFunctionArgument], BaseContext> = async () => ({});

  const context: ContextFunction<[ExpressContextFunctionArgument], {}> = /*   options?.context  ?? */ defaultContext;

  return parseBody().then((body) => {

    const headers = new HeaderMap(request.headers);


    const httpGraphQLRequest: HTTPGraphQLRequest = {
      method: method.toUpperCase(),
      headers,
      search: query.toString() ?? '',
      body: body ?? {},
    };

    server
      .executeHTTPGraphQLRequest({
        httpGraphQLRequest,
        context: () => defaultContext(),
      })
      .then(async (httpGraphQLResponse) => {

        if (httpGraphQLResponse.body.kind === 'complete') {
          const response = new Response(httpGraphQLResponse.body.string, {
            status: 200,
            headers: [...httpGraphQLResponse.headers.entries()],
          });

          send(response);
          return;
        }

        const writableStream = getWritableStream();
        const writer = writableStream.getWriter();
        const encoder = new TextEncoder();

        for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
          writer.write(encoder.encode(chunk));
        }
        writer.close();
      })
      .catch(e => {
        console.error(e);
        next()
      });
  });
};
