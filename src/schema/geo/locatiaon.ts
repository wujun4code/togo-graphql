export const typeDefs = `#graphql

  type Location {
    name: String!
    id: ID!
    lat: String!
    lon: String!
    adm2: String!
    adm1: String!
    country: String!
    tz: String!
    utcOffset: String!
    isDst: String!
    type: String!
    rank: String!
    fxLink: String!

    now: Now!
  }

  type Query {
    searchLocations(location: String!): [Location!]
  }
`;