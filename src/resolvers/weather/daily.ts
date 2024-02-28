import { Daily } from '../../contracts/forecast.js';

export const resolvers = {
    DailyForecastType: {
        Daily3D: Daily.Daily3D,
        Daily7D: Daily.Daily7D,
        Daily10D: Daily.Daily10D,
        Daily15D: Daily.Daily15D,
        Daily30D: Daily.Daily30D,
    },
    Query: {
        getDailyByLocationId: async (parent, args, context, info) => {
            return context.dataSources.weather.forecastDaily(context, args.locationId, args.lang, args.daily, args.limit);
        },
    },
};