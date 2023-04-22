// Construct a schema, using GraphQL schema language

import { Simple } from './dsk/dsk-handler';

export const schema = `
  enum MovementType {
    DEBIT
    CREDIT
  }

  type Movement {
    amount: Float
    date: String
    description: String
    type: MovementType
  }


  type Query {
    hello: String
    movements: [Movement]
  }
`;

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
