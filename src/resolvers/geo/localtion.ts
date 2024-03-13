import { logger, hasRole } from '../../decorators/index.js';

export const resolvers = {
    Query: {
        searchLocations: async (parent, args, context, info) => {
            return context.dataSources.location.searchLocations(context, args.location, args.lang);
        },
        getLocation: async (parent, args, context, info) => {
            return context.dataSources.location.getLocation(context, args.locationId, args.lang);
        },
        topCities: async (parent, args, context, info) => {
            return context.dataSources.location.topCities(context, args.range, args.lang, args.limit);
        },
    },
    Location: {
        now(parent, args, context, info) {
            return context.dataSources.weather.getNow(context, parent.id, args.lang);
        },
        hourly(parent, args, context, info) {
            return context.dataSources.weather.forecastHourly(parent.id, args.lang, args.hourly, args.limit);
        },
        daily(parent, args, context, info) {
            return context.dataSources.weather.forecastDaily(context, parent.id, args.lang, args.daily, args.limit);
        },
        air(parent, args, context, info) {
            const now = context.dataSources.air.getNow(context, parent.id, args.lang);
            return { now };
        },
    }
};