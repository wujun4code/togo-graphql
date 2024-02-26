import { logger, hasRole } from '../../decorators/index.js';

export const resolvers = {
    Query: {
        searchLocations: async (parent, args, { dataSources }, info) => {
            return dataSources.location.searchLocations(args.location, args.lang);
        },
        getLocation: async (parent, args, { dataSources }, info) => {
            return dataSources.location.getLocation(args.locationId, args.lang);
        },
    },
    Location: {
        now(parent, args, context, info) {
            return context.dataSources.weather.getNow(context, parent.id, args.lang);
        },
        hourly(parent, args, { dataSources }, info) {
            return dataSources.weather.forecastHourly(parent.id, args.lang, args.hourly, args.limit);
        },
        daily(parent, args, { dataSources }, info) {
            return dataSources.weather.forecastDaily(parent.id, args.lang, args.daily, args.limit);
        },
    }
};