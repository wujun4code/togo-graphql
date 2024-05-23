export const typeDefs = `#graphql

  type MentionHistory {
    relatedComment: Comment
    relatedPost: Post
    mentioner: SharedPublicProfileInfo!
    mentioned: SharedPublicProfileInfo!
    mentionedFriendlyName: String
  }

  type RobotPublicProfileInfo {
    id: ID!
    relatedUser: SharedPublicProfileInfo!
  }

  type MentionHistoryEdge {
    cursor: String!
    node: MentionHistory!
  }

  type MentionRobotEdge {
    cursor: String!
    node: RobotPublicProfileInfo!
  }

  type MentionerMentionHistoryConnection {
    totalCount: Int!
    edges: [MentionHistoryEdge]!
    pageInfo: PageInfo!
  }

  type MentionRobotConnection {
    totalCount: Int!
    edges: [MentionRobotEdge]!
    pageInfo: PageInfo!
  }

  type SuggestingToMention {
    asMentioner(input: BaseQueryInput): MentionerMentionHistoryConnection!
    topRobots(input: BaseQueryInput): MentionRobotConnection!
  }

  input SuggestedTypingInput {
    enteredText: String
  }

  type Query {
    suggestingToMention(input: SuggestedTypingInput): SuggestingToMention
  }
`