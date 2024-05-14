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

    mentioned: MentionedInPostInput
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

  enum MentionableObjectType {
    USER,
    GROUP
  }

  type MentionableGroup {
    userProfiles: [UserPublicInfo]
  }

  type MentionableObject {
    userProfile: UserPublicInfo
    groupProfile: MentionableGroup
    mentionableObjectType: MentionableObjectType!
  }

  type PostCommentAggregatedInfo {
    totalCount: Int!
  }

  type PostAggregatedInfo {
    comment: PostCommentAggregatedInfo
  }

  type Post {
    id: ID!
    content: String!
    postedAt: String!
    authorInfo: UserPublicInfo!

    comments(input: BaseQueryInput): PostCommentConnection!

    relatedMentionHistories: [MentionHistory]

    aggregatedInfo: PostAggregatedInfo
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

  input MentionedInPostInput {
    users: [MentionedUserInput]
  }

  input MentionedUserInput {
    snsName: String!
    friendlyName: String!
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post
  }
`