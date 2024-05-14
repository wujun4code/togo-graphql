export const typeDefs = `#graphql

  type MentionHistory {
    relatedComment: Comment
    relatedPost: Post
    mentioner: SharedPublicProfileInfo!
    mentioned: SharedPublicProfileInfo!
    mentionedFriendlyName: String
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

  type SuggestingToMention {
    asMentioner(input: BaseQueryInput): MentionerMentionHistoryConnection!
  }

  input SuggestedTypingInput {
    enteredText: String
  }

  type Query {
    suggestingToMention(input: SuggestedTypingInput): SuggestingToMention
  }
`