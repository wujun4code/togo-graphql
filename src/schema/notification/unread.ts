export const typeDefs = `#graphql

  type UnreadNotification {
    unreadMentioned(input: BaseQueryInput): UserUnreadMentionedNotificationConnection!
    unreadComment(input: BaseQueryInput): UserUnreadCommentNotificationConnection!
  }

  type Query {
    unreadNotification: UnreadNotification
  }
`