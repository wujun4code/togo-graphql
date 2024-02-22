export const typeDefs = `#graphql
type DailyForecast {
  fxDate: String!
  sunrise: String!
  sunset: String!
  moonrise: String!
  moonset: String!
  moonPhase: String!
  moonPhaseIcon: String!
  tempMax: String!
  tempMin: String!
  iconDay: String!
  textDay: String!
  iconNight: String!
  textNight: String!
  wind360Day: String!
  windDirDay: String!
  windScaleDay: String!
  windSpeedDay: String!
  wind360Night: String!
  windDirNight: String!
  windScaleNight: String!
  windSpeedNight: String!
  humidity: String!
  precip: String!
  pressure: String!
  vis: String!
  cloud: String!
  uvIndex: String!
}

enum DailyForecastType {
    Daily3D,
    Daily7D,
    Daily10D,
    Daily15D,
    Daily30D
}

# type Refer {
#   sources: [String!]!
#   license: [String!]!
# }

# type WeatherData {
#   code: String!
#   updateTime: String!
#   fxLink: String!
#   daily: [DailyForecast!]!
#   refer: Refer!
# }

type Query {
    getDailyByLocationId(locationId: String!, daily: DailyForecastType! = Daily3D, limit: Int = 3): [DailyForecast!]!
}
`;