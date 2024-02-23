export const typeDefs = `#graphql
type HourlyForecast {
  fxTime: String!
  temp: String!
  icon: String!
  text: String!
  wind360: String!
  windDir: String!
  windScale: String!
  windSpeed: String!
  humidity: String!
  pop: String!
  precip: String!
  pressure: String!
  cloud: String!
  dew: String!
}

enum HourlyForecastType {
    Hourly24H,
    Hourly72H,
    Hourly168H
}

# type WeatherData {
#   code: String!
#   updateTime: String!
#   fxLink: String!
#   hourly: [HourlyForecast!]!
# }

type Query {
    getHourlyByLocationId(locationId: String!, hourly: HourlyForecastType! = Hourly24H, lang: String! = "zh-hans", limit: Int = 4): [HourlyForecast!]!
}
`;