// Construct a schema, using GraphQL schema language

import { Simple } from './dsk/dsk-handler';

// The root provides a resolver function for each API endpoint
export const root = {
  Query: {
    hello: () => {
      return 'Hello sss!';
    },
    movements: () =>{
      return Simple();
    }
  },
};
