export const typeDefs = `#graphql

  input CreateRobotInput {
    relatedUser: CreateUserInput

    hookUrl: String
    website: String
  }

  input QueryRobotInput {
    snsName: String
  }

  type Robot {

    hookUrl: String
    website: String

    relatedUser: SharedPublicProfileInfo!
  }

  type Query {
    robot(input: QueryRobotInput!): Robot
  }
  
  type Mutation {
    createRobot(input: CreateRobotInput): Robot
  }
`