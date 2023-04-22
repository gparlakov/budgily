// Construct a schema, using GraphQL schema language

const movementsName = 'movements';
const movementsParams = 'string';
export const schema = `
  type Movement {

  }


  type Query {
    hello: String,
    ${movementsName}: String
  }
`

// The root provides a resolver function for each API endpoint
export const root = {
  hello: () => {
    return "Hello world!"
  },
}
