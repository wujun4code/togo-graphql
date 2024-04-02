export const typeDefs = `#graphql

  type SharedPublicPost {
    id: ID!
    content: String!
    postedAt: String!    
    authorInfo: SharedPublicProfileInfo!
  }

  input CreatePostInput {
    content: String!
    published: Boolean
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
     cursor: String
  }

  type PostEdge {
    cursor: String!
    node: Post!
  }

  type TimelinePostConnection {
    totalCount: Int!
    edges: [PostEdge]!
    pageInfo: PageInfo!
  }

  type Timeline {
    posts(input: BaseQueryInput): TimelinePostConnection!
  }

  type Post {
    id: ID!
    content: String!
    postedAt: String!
    authorInfo: UserPublicInfo!

    comments(input: BaseQueryInput): PostCommentConnection!
  }

  type TrendingFeed {
    posts(input: BaseQueryInput): TimelinePostConnection!
  }

  type Query {
    timeline: Timeline!
    trendingFeed: TrendingFeed!
    followers: [UserPublicInfo!]
    post(id: ID!): Post
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post
  }
`