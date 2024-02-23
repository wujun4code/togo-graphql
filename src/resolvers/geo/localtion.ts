export const resolvers = {
    Query: {
        searchLocations: async (parent, args, { dataSources }, info) => {
            return dataSources.location.searchLocations(args.location);
        },
        getLocation: async (parent, args, { dataSources }, info) => {
            return dataSources.location.getLocation(args.locationId);
        },
    },
    Location: {
        now(parent, args, { dataSources }, info) {
            return dataSources.weather.getNow(parent.id);
        },
        hourly(parent, args, { dataSources }, info) {
            return dataSources.weather.forcastHourly(parent.id, args.lang, args.hourly, args.limit);
        },
        daily(parent, args, { dataSources }, info) {
            return dataSources.weather.forcastDaily(parent.id, args.lang, args.daily, args.limit);
        },
    }
};