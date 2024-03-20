export const typeDefs = `#graphql

  input GetMyProfileInput {
    provider: String!
    clientId: String!
  }

  type Query {
    myProfile: SharedPublicProfileInfo
    getMyProfile(input: GetMyProfileInput!): SharedPublicProfileInfo
  }

`