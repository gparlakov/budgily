// Construct a schema, using GraphQL schema language


// The root provides a resolver function for each API endpoint
export const root = {
  Query: {
    hello: () => {
      return 'Hello sss!';
    },
    movements: () =>{
      return [];
    }
  },
};
