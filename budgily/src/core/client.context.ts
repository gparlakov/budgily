import { createContextId } from '@builder.io/qwik';
import { ClientContextType } from '@codedoc1/budgily-data-client';

export const ClientContext = createContextId<ClientContextType>('GraphQlClientContext');

export const createClientContext: () => ClientContextType = () => ({
  uri: process.env.API_URL ?? 'http://localhost:3000/graphql',
  name: 'Budgily',
  version: '0',
});
