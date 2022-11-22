const typeDefs = `
  type Query {
    greeting: String
    login(input: loginInput!): UserDetails
  }

  type Mutation {
    createUser(input: createUserInput!): UserDetails
  }


  type UserDetails {
    user: User!
    token: String!
  }
  
  type User {
    name: String
    email: String
  }

  input loginInput {
    email: String
    password: String
  }

  input createUserInput {
    name: String!
    email: String!
    password: String!
  }
`;

module.exports = typeDefs;
