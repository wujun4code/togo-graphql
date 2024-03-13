export const typeDefs = `#graphql

  type Post {
    id: ID!
    content: String!
    postedAt: String!
    authorInfo: UserPublicInfo!
  }

  input CreatePostInput {
    content: String!
    published: Boolean
  }

  input FollowInput {
    openId: String
    snsName: String
  }

  type FollowOperationResult {
    totalFollowing: Int!
    followerRank: Int!
  }
  
  input TimelineQueryInput {
     limit: Int! = 10
     skip: Int! = 0
     filters: JSON
  }

  input BaseQueryInput {
     limit: Int! = 10
     skip: Int! = 0
     filters: JSON
     sorter: JSON
  }

  type Query {
    timeline(input: BaseQueryInput): [Post!]
    followers: [UserPublicInfo!]
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post
    follow(input: FollowInput): FollowOperationResult
  }
`