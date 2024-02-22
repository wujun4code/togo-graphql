export const resolvers = {
    Query: {
        getNowByLocationId: async (parent, args, { dataSources }, info) => {
            return dataSources.weather.getNow(args.locationId, args.lang);
        },
    },
};