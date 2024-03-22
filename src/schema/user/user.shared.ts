export const typeDefs = `#graphql

  interface SharedPublicProfile {
    snsName: String!
    friendlyName: String
  }

  type UserPublicInfo implements SharedPublicProfile {
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
    snsName: String
  }

  type SharedPublicProfileInfo implements SharedPublicProfile {
    snsName: String!
    friendlyName: String
    following: UserPublicInfoFollowing!
    follower: UserPublicInfoFollower!
  }

  type Query {
    publicProfile(input: SharedPublicProfileInput!): SharedPublicProfileInfo
  }

`