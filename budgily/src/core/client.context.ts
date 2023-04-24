
import { createContextId } from '@builder.io/qwik';
import { ClientContext } from '@codedoc1/budgily-data';

export const clientContext = createContextId<ClientContext>('GraphQlClientContext');


export const createClientContext: () => ClientContext = () => ({
  uri: 'http://localhost:3000/graphql',
  name: 'Budgily',
  version: '0',
});
