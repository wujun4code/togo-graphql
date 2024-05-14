export const typeDefs = `#graphql
  input JWTInput {
    provider: String!
    accessToken: String!
    clientId: String!
  }

  input CreateAPIClientInput {
    name: String!
    description: String
  }

  type Authentication {
    jwt: String!
    profile: PrivateProfileInfo!
  }

  type UserAPIClient {
    id: ID!
    apiId: String!
    apiKey: String!
    name: String!
    description: String    
  }

  type UserAPIClientEdge {
    cursor: String!
    node: UserAPIClient!
  }

  type UserAPIClientConnection {
    totalCount: Int!
    edges: [UserAPIClientEdge]!
    pageInfo: PageInfo!
  }

  type Query {
    authentication(input: JWTInput!): Authentication!
  }

  type Mutation {
    createAPIClient(input: CreateAPIClientInput!): UserAPIClient!
  }
`