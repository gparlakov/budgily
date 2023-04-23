import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createContextId, useContextProvider } from '@builder.io/qwik';

export const apolloClientContext = createContextId<ApolloClient<Record<string, never>>>('ApolloClient');


export const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'localhost:3000/graphql',
  name: 'Budgily',
  version: '0'
})

export const createApolloContext: () => Parameters<typeof useContextProvider> = () => [apolloClientContext, client]
