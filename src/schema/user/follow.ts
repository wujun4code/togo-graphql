export const typeDefs = `#graphql

  input FollowInput {
    openId: String
    snsName: String
  }

  input UnfollowInput{
    openId: String
    snsName: String
  }

  type FollowOperationResult {
    totalFollowing: Int!
    followerRank: Int!
  }

  type UnfollowOperationResult {
    totalFollowing: Int!
  }

  type Follow {
    followee : SharedPublicProfileInfo
    follower: SharedPublicProfileInfo
    followedAt: String
  }

  type FollowRelation {
    asFollower: Follow
    asFollowee: Follow
  }

  input FollowRelationInput {
    originalSnsName: String!
    targetSnsName: String!
  }

  type Query {
    followRelation(input: FollowRelationInput!): FollowRelation
  }
  
  type Mutation {
    follow(input: FollowInput): FollowOperationResult
    unfollow(input: UnfollowInput): UnfollowOperationResult
  }
`