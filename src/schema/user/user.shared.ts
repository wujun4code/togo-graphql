export const typeDefs = `#graphql

  interface SharedPublicProfile {
    openId: ID!
    snsName: String!
    friendlyName: String
  }

  type UserPublicInfo implements SharedPublicProfile {
    openId: ID!
    snsName: String!
    friendlyName: String
    following: UserPublicInfoFollowing!
    follower: UserPublicInfoFollower!
    followRelation: FollowRelation!
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
    openId: String
    snsName: String
  }

  type SharedPublicProfileInfo implements SharedPublicProfile {
    openId: ID!
    snsName: String!
    friendlyName: String
    following: UserPublicInfoFollowing!
    follower: UserPublicInfoFollower!
  }

  type Query {
    profile(input: SharedPublicProfileInput!): SharedPublicProfileInfo
  }

`