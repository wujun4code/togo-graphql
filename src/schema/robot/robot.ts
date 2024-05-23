export const typeDefs = `#graphql

  input CreateRobotInput {
    relatedUser: CreateUserInput

    hookUrl: String
    website: String

    headers: [CreateWebHookHeaderInput]

    apiClient: CreateAPIClientInput
  }

  input UpdateRobotInput {

    id: ID!
    hookUrl: String
    website: String

    headers: [CreateWebHookHeaderInput]

    apiClient: CreateAPIClientInput
  }

  input QueryRobotInput {
    snsName: String
  }

  type PrivateRobotInfo {
    id: ID!
    hookUrl: String
    website: String

    relatedUser: PrivateProfileInfo!
    managingUser: PrivateProfileInfo!
  }

  type Robot {
    id: ID!
    hookUrl: String
    website: String

    relatedUser: SharedPublicProfileInfo!
    managingUser: SharedPublicProfileInfo!
  }

  type RobotEdge {
    cursor: String!
    node: Robot!
  }

  type UserRobotConnection {
    totalCount: Int!
    edges: [RobotEdge]!
    pageInfo: PageInfo!
  }  

  type UserRobot {
    managingRobots(input: BaseQueryInput): UserRobotConnection!
  }

  type Query {
    robot(input: QueryRobotInput!): Robot
    userRobot(input: SharedPublicProfileInput): UserRobot
  }
  
  type Mutation {
    createRobot(input: CreateRobotInput): PrivateRobotInfo
    updateRobot(input: UpdateRobotInput): PrivateRobotInfo
  }
`