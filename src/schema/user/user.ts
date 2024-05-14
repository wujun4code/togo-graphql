export const typeDefs = `#graphql

  type OAuth2Provider {
    provider: String!
    clientId: String!
  }

  type OAuth2Binding {
    oauth2: OAuth2Provider
    openId: String!
    createdAt: String!
    updatedAt: String!
    avatar: String
    site: String
  }

  type OAuth2BindingEdge {
    cursor: String!
    node: OAuth2Binding!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }

  type UserOAuth2BindingConnection {
    totalCount: Int!
    edges: [OAuth2BindingEdge]!
    pageInfo: PageInfo!
  }

  type PrivateProfileInfo implements SharedPublicProfile {

    oauth2BindingsConnection(input: BaseQueryInput): UserOAuth2BindingConnection!
    apiClientConnection(input: BaseQueryInput): UserAPIClientConnection!

    snsName: String!
    openId: String!
    friendlyName: String
    following: UserPublicInfoFollowing!
    follower: UserPublicInfoFollower!
    avatar: String
    bio: String
  }

  input CreateUserInput {
    snsName: String
    bio: String
    friendlyName: String
    avatar: String
    email: String
    username: String
  }

  type Query {
    userProfile: PrivateProfileInfo
  }
`