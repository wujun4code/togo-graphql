import { Hourly } from '../../contracts/forecast.js';

export const resolvers = {
    HourlyForecastType: {
        Hourly24H: Hourly.Hourly24H,
        Hourly72H: Hourly.Hourly72H,
        Hourly168H: Hourly.Hourly168H,
    },
    Query: {
        getHourlyByLocationId: async (parent, args, { dataSources }, info) => {
            return dataSources.weather.forecastHourly(args.locationId, args.lang, args.hourly, args.limit);
        },
    },
};