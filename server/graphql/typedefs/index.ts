import { gql } from 'graphql-tag';

const typeDefs = gql`
  type User {
    id: String!
    name: String
    email: String
    address: String
    state: String
    country: String
  }

  type LoginResponse {
    token: String
    error: String
    user: User
  }

  type StatusResponse {
    message: String
    status: String!
  }
  type MessageResponse {
    message: String!
  }

  type Query {
    user: User
  }
  type Mutation {
    registerUser(
      name: String!
      email: String!
      address: String
      state: String
      country: String
      password: String!
    ): User
    login(email: String!, password: String!): LoginResponse!
    sendResetPasswordLink(email: String!): MessageResponse!
    resetPassword(password: String!, token: String!): StatusResponse!
    sendVerificationEmail(email: String!): MessageResponse!
    verifyEmail(token: String!): StatusResponse!
  }
`;

export default typeDefs;
