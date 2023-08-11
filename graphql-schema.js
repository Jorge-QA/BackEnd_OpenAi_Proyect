const { buildSchema } = require('graphql');
exports.graphQLschema = buildSchema(`
  type Query {
    prompts: [Prompt]
    hello: String
    version: String
  }
  
  type Prompt {
    _id: ID!
    name: String
    input: String
  }



  `);

  //    user: [User]
  
  // type User {
  //   _id: ID!
  //   first_name: String
  //   last_name: String
  // }