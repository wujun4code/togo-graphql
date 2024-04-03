export const typeDefs = `#graphql

  type MentionHistory {
    relatedComment: Comment
    relatedPost: Post
    mentioner: SharedPublicProfileInfo!
    mentioned: SharedPublicProfileInfo!
  }

  type MentionHistoryEdge {
    cursor: String!
    node: MentionHistory!
  }

  type MentionerMentionHistoryConnection {
    totalCount: Int!
    edges: [MentionHistoryEdge]!
    pageInfo: PageInfo!
  }

  type SuggestingToType {
    asMentioner(input: BaseQueryInput): MentionerMentionHistoryConnection!
  }

  input SuggestedTypingInput {
    enteredText: String
  }

  type Query {
    suggestingToType(input: SuggestedTypingInput!): SuggestingToType
  }
`