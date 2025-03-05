import { gql } from 'graphql-tag';
import projectTypedefs from './project';

const typeDefs = gql`
  scalar Date

  type Package {
    id: String!
    name: String
    description: String
    price: Float
    creatorId: String
    creator: User
    tags: [String!]
    status: String
    createdAt: Date
    negotiationLimit: Int
  }

  type User {
    id: String!
    name: String
    chatId: Int
    username: String

    brandName: String
    brandLocation: String
    brandIndustry: String

    email: String
    address: String
    location: String
    niche: String
    bio: String
    telegramId: String
    twitterId: String
    facebookId: String
    youtubeId: String
    evmWallet: String
    solWallet: String
    schedule: String
    dob: Date
    country: String
    userType: String

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
    packages: [Package]
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
    updateStaffStatus(userId: String!, status: Boolean): User
  }

  ${projectTypedefs}
`;

export default typeDefs;
