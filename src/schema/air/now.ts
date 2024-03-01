export const typeDefs = `#graphql
  type AirNow {
    pubTime: String
    aqi: String
    level: String
    category: String
    primary: String
    pm10: String
    pm2p5: String
    no2: String
    so2: String
    co: String
    o3: String
  }

  type Air {
    now: AirNow!
  }

  type Query {
    getAirByLocationId(locationId: String!, lang: String! = "zh-hans"): Air!
  }
`;