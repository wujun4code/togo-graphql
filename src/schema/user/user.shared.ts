export const typeDefs = `#graphql

  type UserPublicInfo {
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

`