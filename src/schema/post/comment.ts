export const typeDefs = `#graphql

  type Comment {
    id: ID!
    content: String!
    createdAt: String!
    updatedAt: String!

    authorInfo: UserPublicInfo!

    post: Post!
  }

  type CommentEdge {
    cursor: String!
    node: Comment!
  }

  type PostCommentConnection {
    totalCount: Int!
    edges: [CommentEdge]!
    pageInfo: PageInfo!
  }

  input CreateCommentInput {
    postId: ID!
    replyToId: ID
    threadId: ID
    content: String!
  }

  type Mutation {
    createComment(input: CreateCommentInput!): Comment
  }
`