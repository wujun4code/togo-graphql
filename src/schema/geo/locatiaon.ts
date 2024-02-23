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

    now(lang: String! = "zh-hans"): Now!

    hourly(hourly: HourlyForecastType! = Hourly24H, lang: String! = "zh-hans", limit: Int = 4): [HourlyForecast!]!

    daily(daily: DailyForecastType! = Daily3D, lang: String! = "zh-hans", limit: Int = 3): [DailyForecast!]!
  }

  type Query {
    searchLocations(location: String!, lang: String! = "zh-hans"): [Location!]!
    getLocation(locationId: String!, lang: String! = "zh-hans"): [Location!]!
  }
`