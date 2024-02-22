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

    hourly(hourly: HourlyForecastType! = Hourly24H, limit: Int = 4): [HourlyForecast!]!

    daily(daily: DailyForecastType! = Daily3D, limit: Int = 3): [DailyForecast!]!
  }

  type Query {
    searchLocations(location: String!): [Location!]
  }
`;