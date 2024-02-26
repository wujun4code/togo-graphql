export const typeDefs = `#graphql
type Now {
    obsTime: String!
    temp: String
    feelsLike: String!
    icon: String!
    text: String!
    wind360: String!
    windDir: String
    windScale: String!
    windSpeed: String!
    humidity: String!
    precip: String!
    pressure: String!
    vis: String!
    cloud: String!
    dew: String!
  }
  
#   type Refer {
#     sources: [String!]!
#     license: [String!]!
#   }
  
#   type WeatherData {
#     code: String!
#     updateTime: String!
#     fxLink: String!
#     now: Now!
#     refer: Refer!
#   }
  
  type Query {
    getNowByLocationId(locationId: String!, lang: String! = "zh-hans"): Now!
  }
`;