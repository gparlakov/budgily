export const schema = `
  type Query {
    hello: String
  }
`;

export const root = {
  hello: () => 'Hello'
}
