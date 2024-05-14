export const typeDefs = `#graphql
  type CommentCreated {
    id: ID!
  }

  type UnreadCommentNotification {
    id: Int!
    relatedComment: Comment!
    createdAt: String!
  }

  type UnreadCommentNotificationEdge {
    cursor: String!
    node: UnreadCommentNotification!
  }

  type UserUnreadCommentNotificationConnection {
    totalCount: Int!
    edges: [UnreadCommentNotificationEdge]!
    pageInfo: PageInfo!
  }

  type Subscription {
    commentCreated: Comment!
    unreadCommentNotificationCreated: UnreadCommentNotification!
  }
`