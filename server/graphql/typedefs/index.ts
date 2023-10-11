import { gql } from 'graphql-tag';
import projectTypedefs from './project';

const typeDefs = gql`
  scalar Date

  type User {
    id: String!
    name: String
    chatId: Int;
    username: String;
    phone: String;
    dob: String;
    group: String;
    experience: Int;
    gender: String;
    race: String;
    citizenship: String;
    qualification: String;
    cover: String;
    categoryPreference: [String]
    typePreference: [String]
    locationPreference: String
    hp: String;

    isStaff: Boolean
    isAdmin: Boolean
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
    users: [User]
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
    login(username: String!, password: String!): LoginResponse!
    sendResetPasswordLink(email: String!): MessageResponse!
    resetPassword(password: String!, token: String!): StatusResponse!
    sendVerificationEmail(email: String!): MessageResponse!
    verifyEmail(token: String!): StatusResponse!
    updateAdminStatus(userId: String!, status: Boolean): User
  }

  ${projectTypedefs}
`;

export default typeDefs;
