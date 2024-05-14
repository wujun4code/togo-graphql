export const typeDefs = `#graphql
  type MentionedCreated {
    id: ID!
  }

  type UnreadMentionedNotification {
    id: Int!
    relatedHistory: MentionHistory
    createdAt: String!
  }

  type UnreadMentionedNotificationEdge {
    cursor: String!
    node: UnreadMentionedNotification!
  }

  type UserUnreadMentionedNotificationConnection {
    totalCount: Int!
    edges: [UnreadMentionedNotificationEdge]!
    pageInfo: PageInfo!
  }

  type UnreadNotification {
    unreadMentioned(input: BaseQueryInput): UserUnreadMentionedNotificationConnection!
  }

  type Subscription {
    mentionedCreated: MentionHistory!
    unreadMentionedNotificationCreated: UnreadMentionedNotification!
  }
`