export const typeDefs = `#graphql

  interface SharedPublicProfile {
    snsName: String!
    friendlyName: String
    avatar: String
    bio: String
  }

  type UserPublicInfo implements SharedPublicProfile {
    snsName: String!
    openId: String!
    friendlyName: String
    following: UserPublicInfoFollowing!
    follower: UserPublicInfoFollower!
    followRelation: FollowRelation!
    avatar: String
    bio: String
  }

  type FollowRelation {
    followed: Boolean!
    followingMe: Boolean!
  }

  type UserPublicInfoFollowing {
    totalCount: Int!
  }

  type UserPublicInfoFollower {
    totalCount: Int!
  }

  input SharedPublicProfileInput {
    snsName: String
  }

  type PublicProfilePostConnection {
    totalCount: Int!
    edges: [PostEdge]!
    pageInfo: PageInfo!
  }

  type SharedPublicProfileInfoEdge {
    cursor: String!
    node: SharedPublicProfileInfo!
  }

  type SharedPublicProfileInfo implements SharedPublicProfile {
    snsName: String!
    openId: String!
    friendlyName: String
    following: UserPublicInfoFollowing!
    follower: UserPublicInfoFollower!
    avatar: String
    bio: String

    posts(input: BaseQueryInput): PublicProfilePostConnection!
  }

  type Query {
    publicProfile(input: SharedPublicProfileInput!): SharedPublicProfileInfo
  }

`