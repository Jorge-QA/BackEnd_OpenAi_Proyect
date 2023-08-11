const { buildSchema } = require('graphql');
exports.graphQLschema = buildSchema(`
  type Query {
    prompts: [Prompt]
    hello: String
    version: String
  }
  
  type Prompt {
    _id: ID!,
    name: String!,
    type: String!,
    tags: [String],
    input: String!,
    n: String,
    size: String,
    user: String!,
    response: [String]
  }`);

  //    user: [User]
  
  // type User {
  //   _id: ID!
  //   first_name: String
  //   last_name: String
  // }