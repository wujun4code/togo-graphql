export const typeDefs = `#graphql
  input JWTInput {
    provider: String!
    accessToken: String!
    clientId: String!
  }

  type Authentication {
    jwt: String!
    profile: PrivateProfileInfo!
  }

  type Query {
    authentication(input: JWTInput!): Authentication!
  }
`